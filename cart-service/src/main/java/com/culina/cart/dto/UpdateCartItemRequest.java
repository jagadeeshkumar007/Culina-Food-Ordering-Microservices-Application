package com.culina.cart.dto;

public class UpdateCartItemRequest {
    private Long menuItemId;
    private int quantity; 

    public Long getMenuItemId() {
        return menuItemId;
    }

    public int getQuantity() {
        return quantity;
    }
}
