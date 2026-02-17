package com.culina.cart.dto;

import java.util.List;

public class CreateOrderRequest {

    private Long chefId;
    private List<OrderItemRequest> items;
    private Long totalAmountCents;
    private String currency;

    // getters & setters
    public Long getChefId() {
        return chefId;
    }

    public void setChefId(Long chefId) {
        this.chefId = chefId;
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }

    public Long getTotalAmountCents() {
        return totalAmountCents;
    }

    public void setTotalAmountCents(Long totalAmountCents) {
        this.totalAmountCents = totalAmountCents;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }
}
