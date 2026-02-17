package com.culina.cart.exception;

public class ChefConflictException extends RuntimeException {
    private Long conflictingChefId;

    public ChefConflictException(String message) {
        super(message);
    }

    public ChefConflictException(String message, Long conflictingChefId) {
        super(message);
        this.conflictingChefId = conflictingChefId;
    }

    public Long getConflictingChefId() {
        return conflictingChefId;
    }
}
