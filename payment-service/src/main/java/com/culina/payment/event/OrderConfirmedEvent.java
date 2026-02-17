package com.culina.payment.event;

public class OrderConfirmedEvent {

    private Long orderId;
    private Long userId;
    private Long chefId;
    private Long totalAmountCents;  

    public OrderConfirmedEvent() {
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
