package com.culina.order.chef.dto;

public class ChefOrderStatsResponse {

    private long total;
    private long pending;
    private long preparing;
    private long ready;

    public ChefOrderStatsResponse(
            long total,
            long pending,
            long preparing,
            long ready) {
        this.total = total;
        this.pending = pending;
        this.preparing = preparing;
        this.ready = ready;
    }

    public long getTotal() {
        return total;
    }

    public long getPending() {
        return pending;
    }

    public long getPreparing() {
        return preparing;
    }

    public long getReady() {
        return ready;
    }
}
