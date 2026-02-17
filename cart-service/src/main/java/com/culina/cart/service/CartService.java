package com.culina.cart.service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.culina.cart.dto.CheckoutRequest;
import com.culina.cart.dto.CreateOrderRequest;
import com.culina.cart.dto.OrderItemRequest;
import com.culina.cart.dto.UpdateCartItemRequest;
import com.culina.cart.model.Cart;
import com.culina.cart.model.CartItem;

@Service
public class CartService {

    private final RedisTemplate<String, Cart> redisTemplate;
    private final RestTemplate restTemplate;
    private static final Duration CART_TTL = Duration.ofDays(7);

    public CartService(RedisTemplate<String, Cart> redisTemplate, RestTemplate restTemplate) {
        this.redisTemplate = redisTemplate;
        this.restTemplate = restTemplate;
    }

    private String key(Long userId) {
        return "cart:" + userId;
    }

    public Cart getCart(Long userId) {
        Cart cart = redisTemplate.opsForValue().get(key(userId));
        if (cart == null) {
            cart = new Cart();
            cart.setUserId(userId);
        }
        return cart;
    }

    public void addItem(Long userId, CartItem item) {
        if (item.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }

        Cart cart = getCart(userId);

        // Check if cart has items from a different chef
        if (!cart.isEmpty()) {
            CartItem firstItem = cart.getItems().iterator().next();
            Long currentChefId = firstItem.getChefId();

            if (currentChefId != null && item.getChefId() != null &&
                    !currentChefId.equals(item.getChefId())) {
                throw new com.culina.cart.exception.ChefConflictException(
                        "Cart contains items from a different chef",
                        currentChefId);
            }
        }

        cart.setUserId(userId);

        // Use the Cart's built-in method to properly add/update items
        cart.addOrUpdateItem(item);

        redisTemplate.opsForValue().set(key(userId), cart, CART_TTL);
    }

    public void removeItem(Long userId, Long menuItemId) {
        Cart cart = getCart(userId);

        cart.removeItem(menuItemId);

        if (cart.isEmpty()) {
            redisTemplate.delete(key(userId));
        } else {
            redisTemplate.opsForValue().set(key(userId), cart, CART_TTL);
        }
    }

    public void clear(Long userId) {
        redisTemplate.delete(key(userId));
    }

    public Long checkout(Authentication authentication, String authHeader, CheckoutRequest request) {
        Long userId = Long.valueOf(authentication.getName());
        String key = "cart:" + userId;

        Cart cart = redisTemplate.opsForValue().get(key);
        if (cart == null || cart.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Validate all items have valid quantities
        for (CartItem item : cart.getItems()) {
            if (item.getQuantity() <= 0) {
                throw new RuntimeException("Invalid quantity for item: " + item.getMenuItemId());
            }
        }

        CreateOrderRequest orderRequest = new CreateOrderRequest();
        orderRequest.setChefId(request.getChefId());
        orderRequest.setCurrency(request.getCurrency());

        long total = 0;
        List<OrderItemRequest> items = new ArrayList<>();

        for (CartItem item : cart.getItems()) {
            OrderItemRequest oi = new OrderItemRequest();
            oi.setMenuItemId(item.getMenuItemId());
            oi.setQuantity(item.getQuantity());
            oi.setPriceCents(item.getPriceCents());
            items.add(oi);

            total += item.getPriceCents() * item.getQuantity();
        }

        orderRequest.setItems(items);
        orderRequest.setTotalAmountCents(total);

        String token = authHeader.replace("Bearer ", "");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(token);

        HttpEntity<CreateOrderRequest> entity = new HttpEntity<>(orderRequest, headers);

        ResponseEntity<Long> response = restTemplate.postForEntity(
                "http://culina-order:8081/order/createOrder",
                entity,
                Long.class);

        redisTemplate.delete(key);
        return response.getBody();
    }

    public void updateQuantity(Long userId, UpdateCartItemRequest request) {
        Cart cart = getCart(userId);

        if (cart.isEmpty()) {
            throw new RuntimeException("Cart not found");
        }

        cart.updateQuantity(request.getMenuItemId(), request.getQuantity());

        if (cart.isEmpty()) {
            redisTemplate.delete(key(userId));
        } else {
            redisTemplate.opsForValue().set(key(userId), cart, CART_TTL);
        }
    }
}