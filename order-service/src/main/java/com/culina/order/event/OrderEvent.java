package com.culina.order.event;

import com.culina.order.domain.model.OrderStatus;

public class OrderEvent {

    private Long orderId;
    private Long userId;
    private Long chefId;
    private OrderStatus status;
    private Long totalAmountCents;

    public OrderEvent(Long orderId, Long userId, Long chefId,
            OrderStatus status, Long totalAmountCents) {
        this.orderId = orderId;
        this.userId = userId;
        this.chefId = chefId;
        this.status = status;
        this.totalAmountCents = totalAmountCents;
    }

    // getters only (events are immutable)
    public Long getOrderId() {
        return orderId;
    }

    public Long getUserId() {
        return userId;
    }

    public Long getChefId() {
        return chefId;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public Long getTotalAmountCents() {
        return totalAmountCents;
    }
}
