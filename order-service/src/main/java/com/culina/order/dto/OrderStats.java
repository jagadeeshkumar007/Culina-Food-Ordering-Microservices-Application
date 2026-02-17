package com.culina.order.dto;

public class OrderStats {
    private long pending;
    private long preparing;
    private long ready;

    public OrderStats(long pending, long preparing, long ready) {
        this.pending = pending;
        this.preparing = preparing;
        this.ready = ready;
    }

    public long getPending() {
        return pending;
    }

    public void setPending(long pending) {
        this.pending = pending;
    }

    public long getPreparing() {
        return preparing;
    }

    public void setPreparing(long preparing) {
        this.preparing = preparing;
    }

    public long getReady() {
        return ready;
    }

    public void setReady(long ready) {
        this.ready = ready;
    }
}
