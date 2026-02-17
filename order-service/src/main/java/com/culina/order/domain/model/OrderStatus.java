package com.culina.order.domain.model;

public enum OrderStatus {

    CREATED,
    CONFIRMED,
    PAID,
    PREPARING,
    READY,
    DELIVERED,
    CANCELLED;

    public boolean isTerminal() {
        return this == DELIVERED || this == CANCELLED;
    }
}
