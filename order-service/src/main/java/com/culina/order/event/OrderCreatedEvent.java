package com.culina.order.event;

public class OrderCreatedEvent {

    private Long orderId;
    private Long userId;
    private Long chefId;
    private Long totalAmountCents;

    public OrderCreatedEvent(Long orderId, Long userId, Long chefId, Long totalAmountCents) {
        this.orderId = orderId;
        this.userId = userId;
        this.chefId = chefId;
        this.totalAmountCents = totalAmountCents;
    }

    public Long getOrderId() {
        return orderId;
    }

    public Long getUserId() {
        return userId;
    }

    public Long getChefId() {
        return chefId;
    }

    public Long getTotalAmountCents() {
        return totalAmountCents;
    }
}
