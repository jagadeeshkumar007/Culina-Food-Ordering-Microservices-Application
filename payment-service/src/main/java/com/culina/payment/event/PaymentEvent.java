package com.culina.payment.event;

import com.culina.payment.model.PaymentStatus;

public class PaymentEvent {

    private Long orderId;
    private Long userId;
    private PaymentStatus status;      
    private Long amountCents;

    public PaymentEvent() {
    }

    public PaymentEvent(
            Long orderId,
            Long userId,
            PaymentStatus status,
            Long amountCents
    ) {
        this.orderId = orderId;
        this.userId = userId;
        this.status = status;
        this.amountCents = amountCents;
    }

    public Long getOrderId() {
        return orderId;
    }

    public Long getUserId() {
        return userId;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public Long getAmountCents() {
        return amountCents;
    }
}

