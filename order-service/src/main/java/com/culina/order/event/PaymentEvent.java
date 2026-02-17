package com.culina.order.event;

public class PaymentEvent {

    private Long orderId;
    private Long userId;
    private String status;
    private Long amountCents;

    public PaymentEvent() {
    }

    public Long getOrderId() {
        return orderId;
    }

    public Long getUserId() {
        return userId;
    }

    public String getStatus() {
        return status;
    }

    public Long getAmountCents() {
        return amountCents;
    }
}
