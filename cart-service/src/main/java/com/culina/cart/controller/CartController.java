package com.culina.cart.controller;

import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.culina.cart.dto.CheckoutRequest;
import com.culina.cart.dto.UpdateCartItemRequest;
import com.culina.cart.exception.ChefConflictException;
import com.culina.cart.model.Cart;
import com.culina.cart.model.CartItem;
import com.culina.cart.service.CartService;

import jakarta.servlet.http.HttpServletRequest;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    /**
     * Extract userId from Authentication object
     */
    private Long getUserId(Authentication authentication) {
        // authentication.getName() typically returns the username/userId as String
        // authentication.getPrincipal() might return UserDetails or other object
        try {
            return Long.valueOf(authentication.getName());
        } catch (NumberFormatException e) {
            throw new IllegalStateException("Invalid user ID in authentication", e);
        }
    }

    /**
     * Handle chef conflict exceptions
     */
    @ExceptionHandler(ChefConflictException.class)
    public ResponseEntity<Map<String, Object>> handleChefConflict(ChefConflictException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", "CHEF_CONFLICT");
        response.put("message", ex.getMessage());
        response.put("conflictingChefId", ex.getConflictingChefId());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    @PostMapping("/add")
    public ResponseEntity<Void> add(Authentication authentication, @RequestBody CartItem item) {
        Long userId = getUserId(authentication);
        System.out.println("Received CartItem: " + item);
        System.out.println("MenuItemId: " + item.getMenuItemId());
        cartService.addItem(userId, item);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<Cart> view(Authentication authentication) {
        Long userId = getUserId(authentication);
        Cart cart = cartService.getCart(userId);
        return ResponseEntity.ok(cart);
    }

    @GetMapping("/items")
    public ResponseEntity<?> getItems(Authentication authentication) {
        Long userId = getUserId(authentication);
        Cart cart = cartService.getCart(userId);
        return ResponseEntity.ok(cart.getItems());
    }

    @PostMapping("/update")
    public ResponseEntity<Void> update(Authentication authentication, @RequestBody UpdateCartItemRequest request) {
        Long userId = getUserId(authentication);
        cartService.updateQuantity(userId, request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/remove/{menuItemId}")
    public ResponseEntity<Void> remove(Authentication authentication, @PathVariable Long menuItemId) {
        Long userId = getUserId(authentication);
        cartService.removeItem(userId, menuItemId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/clear")
    @PostMapping("/clear")
    public ResponseEntity<Void> clear(Authentication authentication) {
        Long userId = getUserId(authentication);
        cartService.clear(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/checkout")
    public ResponseEntity<Long> checkout(
            HttpServletRequest request,
            Authentication authentication,
            @RequestBody CheckoutRequest body) {
        String authHeader = request.getHeader("Authorization");
        Long orderId = cartService.checkout(authentication, authHeader, body);
        return ResponseEntity.ok(orderId);
    }

}
