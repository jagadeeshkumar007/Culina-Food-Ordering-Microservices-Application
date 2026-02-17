package com.culina.order.controller;

import com.culina.order.domain.model.Order;
import com.culina.order.domain.model.OrderStatus;
import com.culina.order.dto.CreateOrderRequest;
import com.culina.order.dto.OrderStats;
import com.culina.order.service.OrderService;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/order")
public class OrderController {

        private final OrderService orderService;

        public OrderController(OrderService orderService) {
                this.orderService = orderService;
        }

        @GetMapping
        public ResponseEntity<List<Order>> getOrders(
                        Authentication authentication,
                        @RequestParam(required = false) String role) {

                Long userId = Long.valueOf(authentication.getName());

                if ("chef".equalsIgnoreCase(role)) {
                        return ResponseEntity.ok(orderService.getOrdersForChef(userId));
                }

                return ResponseEntity.ok(orderService.getOrdersByUser(userId));
        }

        @GetMapping("/chef/pending")
        public ResponseEntity<List<Order>> getPendingOrders(Authentication authentication) {
                Long chefUserId = Long.valueOf(authentication.getName());
                return ResponseEntity.ok(orderService.getPendingOrdersForChef(chefUserId));
        }

        @GetMapping("/chef/stats")
        public ResponseEntity<OrderStats> getChefStats(Authentication authentication) {
                Long chefUserId = Long.valueOf(authentication.getName());
                return ResponseEntity.ok(orderService.getStatsForChef(chefUserId));
        }

        @PostMapping("/createOrder")
        public ResponseEntity<Long> createOrder(Authentication authentication,
                        @RequestBody CreateOrderRequest request) {
                Long userId = Long.valueOf(authentication.getName());
                Order order = orderService.createOrder(userId, request);
                return ResponseEntity.ok(order.getId());
        }

        // USER → cancel order
        @PostMapping("/{orderId}/cancel")
        public ResponseEntity<Order> cancelOrder(
                        @PathVariable Long orderId,
                        Authentication authentication) {
                Long userId = (Long) authentication.getPrincipal();
                Order order = orderService.updateStatus(
                                orderId,
                                OrderStatus.CANCELLED,
                                userId,
                                false);

                return ResponseEntity.ok(order);
        }

        // CHEF → confirm order
        @PostMapping("/{orderId}/confirm")
        public ResponseEntity<Order> confirmOrder(
                        @PathVariable Long orderId,
                        Authentication authentication) {
                Long chefUserId = Long.valueOf(authentication.getName());

                Order order = orderService.updateStatus(
                                orderId,
                                OrderStatus.CONFIRMED,
                                chefUserId,
                                true);

                return ResponseEntity.ok(order);
        }

        // CHEF → preparing
        @PostMapping("/{orderId}/preparing")
        public ResponseEntity<Order> preparingOrder(
                        @PathVariable Long orderId,
                        Authentication authentication) {
                Long chefUserId = (Long) authentication.getPrincipal();

                Order order = orderService.updateStatus(
                                orderId,
                                OrderStatus.PREPARING,
                                chefUserId,
                                true);

                return ResponseEntity.ok(order);
        }

        // CHEF → ready
        @PostMapping("/{orderId}/ready")
        public ResponseEntity<Order> readyOrder(
                        @PathVariable Long orderId,
                        Authentication authentication) {
                Long chefUserId = (Long) authentication.getPrincipal();

                Order order = orderService.updateStatus(
                                orderId,
                                OrderStatus.READY,
                                chefUserId,
                                true);

                return ResponseEntity.ok(order);
        }

        // SYSTEM / DELIVERY → delivered
        @PostMapping("/{orderId}/delivered")
        public ResponseEntity<Order> deliveredOrder(
                        @PathVariable Long orderId) {
                // Later: delivery-service authentication
                Order order = orderService.updateStatus(
                                orderId,
                                OrderStatus.DELIVERED,
                                null,
                                true);

                return ResponseEntity.ok(order);
        }
}
