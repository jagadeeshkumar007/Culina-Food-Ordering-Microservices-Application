package com.culina.order.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.culina.order.chef.model.Chef;
import com.culina.order.chef.repository.ChefRepository;
import com.culina.order.domain.OrderStateMachine;
import com.culina.order.domain.model.Order;
import com.culina.order.domain.model.OrderItem;
import com.culina.order.domain.model.OrderStatus;
import com.culina.order.dto.CreateOrderItemRequest;
import com.culina.order.dto.CreateOrderRequest;
import com.culina.order.dto.OrderStats;
import com.culina.order.event.OrderEvent;
import com.culina.order.event.OrderEventPublisher;
import com.culina.order.menu.model.MenuItem;
import com.culina.order.menu.repository.MenuItemRepository;
import com.culina.order.repository.OrderRepository;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ChefRepository chefRepository;
    private final OrderEventPublisher eventPublisher;
    private final MenuItemRepository menuItemRepository;

    public OrderService(OrderRepository orderRepository,
            ChefRepository chefRepository,
            OrderEventPublisher eventPublisher,
            MenuItemRepository menuItemRepository) {
        this.orderRepository = orderRepository;
        this.chefRepository = chefRepository;
        this.eventPublisher = eventPublisher;
        this.menuItemRepository = menuItemRepository;
    }

    public List<Order> getOrdersByUser(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public Order updateStatus(
            Long orderId,
            OrderStatus newStatus,
            Long actorUserId,
            boolean isChef) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        Chef chef = chefRepository.findById(order.getChefId())
                .orElseThrow(() -> new RuntimeException("Chef profile not found"));
        // AUTHORIZATION
        if (isChef && !chef.getUserId().equals(actorUserId)) {
            throw new RuntimeException("Chef not authorized");
        }

        if (!isChef && !order.getUserId().equals(actorUserId)) {
            throw new RuntimeException("User not authorized");
        }

        // STATE VALIDATION
        if (!OrderStateMachine.canTransition(order.getStatus(), newStatus)) {
            throw new RuntimeException(
                    "Invalid order state transition: "
                            + order.getStatus() + " → " + newStatus);
        }

        OrderStatus oldStatus = order.getStatus();
        order.setStatus(newStatus);
        Order saved = orderRepository.save(order);

        // INVENTORY MANAGEMENT: Reduce quantity when order is confirmed
        if (newStatus == OrderStatus.CONFIRMED && oldStatus != OrderStatus.CONFIRMED) {
            reduceInventory(order);
        }

        // INVENTORY MANAGEMENT: Restore quantity when order is cancelled
        if (newStatus == OrderStatus.CANCELLED && (oldStatus == OrderStatus.CONFIRMED ||
                oldStatus == OrderStatus.PAID || oldStatus == OrderStatus.PREPARING)) {
            restoreInventory(order);
        }

        OrderEvent event = new OrderEvent(
                saved.getId(),
                saved.getUserId(),
                saved.getChefId(),
                saved.getStatus(),
                saved.getTotalAmountCents());

        switch (newStatus) {
            case CONFIRMED -> eventPublisher.publish("order.confirmed", event);
            case CANCELLED -> eventPublisher.publish("order.cancelled", event);
            case READY -> eventPublisher.publish("order.ready", event);
            case DELIVERED -> eventPublisher.publish("order.delivered", event);
            default -> {
            }
        }

        return saved;
    }

    @Transactional
    public Order createOrder(Long userId, CreateOrderRequest request) {
        Chef chef = chefRepository.findById(request.getChefId())
                .orElseThrow(() -> new RuntimeException("CHEF_NOT_FOUND"));

        Order order = new Order();
        order.setUserId(userId);
        order.setChefId(chef.getId());
        order.setStatus(OrderStatus.CREATED);

        List<OrderItem> items = new ArrayList<>();
        long total = 0;

        for (CreateOrderItemRequest req : request.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(req.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("MENU_ITEM_NOT_FOUND"));

            if (!menuItem.getIsAvailable())
                throw new RuntimeException("ITEM_NOT_AVAILABLE");

            if (!menuItem.getPriceCents().equals(req.getPriceCents()))
                throw new RuntimeException("PRICE_CHANGED");

            // INVENTORY VALIDATION & QUANTITY REDUCTION
            if (menuItem.getAvailableQty() != null) {
                if (menuItem.getAvailableQty() < req.getQuantity()) {
                    throw new RuntimeException("INSUFFICIENT_STOCK: " + menuItem.getName() +
                            " (Available: " + menuItem.getAvailableQty() + ", Requested: " + req.getQuantity() + ")");
                }

                // REDUCE QUANTITY when order is booked
                menuItem.setAvailableQty(menuItem.getAvailableQty() - req.getQuantity());
                menuItemRepository.save(menuItem);

                // Auto-disable if out of stock
                if (menuItem.getAvailableQty() == 0) {
                    menuItem.setIsAvailable(false);
                    menuItemRepository.save(menuItem);
                }
            }

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setMenuItemId(menuItem.getId());
            item.setItemName(menuItem.getName());
            item.setItemPriceCents(menuItem.getPriceCents());
            item.setQuantity(req.getQuantity());

            items.add(item);
            total += menuItem.getPriceCents() * req.getQuantity();
        }

        if (total != request.getTotalAmountCents())
            throw new RuntimeException("TOTAL_MISMATCH");

        order.setItems(items);
        order.setTotalAmountCents(total);

        Order saved = orderRepository.save(order);

        eventPublisher.publish("order.created",
                new OrderEvent(
                        saved.getId(),
                        userId,
                        saved.getChefId(),
                        saved.getStatus(),
                        saved.getTotalAmountCents()));

        return saved;

    }

    @Transactional
    public void markPaid(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow();

        if (!OrderStateMachine.canTransition(
                order.getStatus(), OrderStatus.PAID)) {
            return;
        }

        order.setStatus(OrderStatus.PAID);
        Order saved = orderRepository.save(order);

        // Publish event so chef can see order
        eventPublisher.publish("order.paid",
                new OrderEvent(
                        saved.getId(),
                        saved.getUserId(),
                        saved.getChefId(),
                        saved.getStatus(),
                        saved.getTotalAmountCents()));
    }

    @Transactional
    public void cancelAfterPaymentFailure(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow();

        // Restore quantities since payment failed
        restoreInventory(order);

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    public List<Order> getOrdersForChef(Long userId) {

        Chef chef = chefRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("CHEF_PROFILE_NOT_FOUND"));

        return orderRepository.findByChefIdOrderByCreatedAtDesc(chef.getId());
    }

    public List<Order> getPendingOrdersForChef(Long chefUserId) {
        Chef chef = chefRepository.findByUserId(chefUserId)
                .orElseThrow(() -> new RuntimeException("CHEF_PROFILE_NOT_FOUND"));

        // Show PAID (pending acceptance), CONFIRMED (accepted), and PREPARING (in
        // progress)
        // Hide READY orders (they move down) and DELIVERED/CANCELLED
        List<OrderStatus> activeStatuses = java.util.Arrays.asList(
                OrderStatus.PAID,
                OrderStatus.CONFIRMED,
                OrderStatus.PREPARING);

        return orderRepository.findByChefIdAndStatusInOrderByCreatedAtDesc(
                chef.getId(),
                activeStatuses);
    }

    public OrderStats getStatsForChef(Long chefUserId) {
        Chef chef = chefRepository.findByUserId(chefUserId)
                .orElseThrow(() -> new RuntimeException("CHEF_PROFILE_NOT_FOUND"));

        // Pending = PAID (awaiting acceptance) + CONFIRMED (accepted, not started)
        long pending = orderRepository.countByChefIdAndStatus(chef.getId(), OrderStatus.PAID)
                + orderRepository.countByChefIdAndStatus(chef.getId(), OrderStatus.CONFIRMED);

        long preparing = orderRepository.countByChefIdAndStatus(chef.getId(), OrderStatus.PREPARING);
        long ready = orderRepository.countByChefIdAndStatus(chef.getId(), OrderStatus.READY);

        return new OrderStats(pending, preparing, ready);
    }

    // INVENTORY MANAGEMENT METHODS

    /**
     * Reduce inventory quantities for all items in the order
     */
    private void reduceInventory(Order order) {
        for (OrderItem item : order.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(item.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("MENU_ITEM_NOT_FOUND"));

            if (menuItem.getAvailableQty() != null) {
                int newQty = menuItem.getAvailableQty() - item.getQuantity();
                menuItem.setAvailableQty(Math.max(0, newQty));

                // Auto-disable if out of stock
                if (menuItem.getAvailableQty() == 0) {
                    menuItem.setIsAvailable(false);
                }

                menuItemRepository.save(menuItem);
            }
        }
    }

    /**
     * Restore inventory quantities for all items in the order
     */
    private void restoreInventory(Order order) {
        for (OrderItem item : order.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(item.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("MENU_ITEM_NOT_FOUND"));

            if (menuItem.getAvailableQty() != null) {
                menuItem.setAvailableQty(menuItem.getAvailableQty() + item.getQuantity());

                // Re-enable if it was disabled due to stock
                if (menuItem.getAvailableQty() > 0 && !menuItem.getIsAvailable()) {
                    menuItem.setIsAvailable(true);
                }

                menuItemRepository.save(menuItem);
            }
        }
    }

}
