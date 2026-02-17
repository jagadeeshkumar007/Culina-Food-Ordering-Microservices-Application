package com.culina.order.chef.model;

import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "chefs")
public class Chef {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // From Auth Service (JWT subject)
    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column(name = "kitchen_name")
    private String kitchenName;

    @Column
    private String description;

    @Column(name = "cuisine_type")
    private String cuisineType;

    @Column(name = "verification_status", nullable = false)
    private String verificationStatus; // PENDING, APPROVED, REJECTED

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "avg_rating")
    private Double avgRating = 0.0;

    @Column(name = "total_orders", nullable = false)
    private Long totalOrders = 0L;

    @Column(name = "last_active_at")
    private OffsetDateTime lastActiveAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        OffsetDateTime now = OffsetDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    /* ===== Getters & Setters ===== */

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getKitchenName() {
        return kitchenName;
    }

    public void setKitchenName(String kitchenName) {
        this.kitchenName = kitchenName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCuisineType() {
        return cuisineType;
    }

    public void setCuisineType(String cuisineType) {
        this.cuisineType = cuisineType;
    }

    public String getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(String verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean active) {
        isActive = active;
    }

    public Double getAvgRating() {
        return avgRating;
    }

    public void setAvgRating(Double avgRating) {
        this.avgRating = avgRating;
    }

    public Long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(Long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public OffsetDateTime getLastActiveAt() {
        return lastActiveAt;
    }

    public void setLastActiveAt(OffsetDateTime lastActiveAt) {
        this.lastActiveAt = lastActiveAt;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}
