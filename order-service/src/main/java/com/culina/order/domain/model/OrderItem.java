package com.culina.order.domain.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonBackReference
    private Order order;

    @Column(name = "menu_item_id", nullable = false)
    private Long menuItemId;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Column(name = "item_price_cents", nullable = false)
    private Long itemPriceCents;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    void prePersist() {
        createdAt = OffsetDateTime.now();
    }

    /* getters & setters */
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public Order getOrder() {
        return order;
    }
    public void setOrder(Order order) {
        this.order = order;
    }
    public Long getMenuItemId() {
        return menuItemId;
    }
    public void setMenuItemId(Long menuItemId) {
        this.menuItemId = menuItemId;
    }
    public String getItemName() {
        return itemName;
    }
    public void setItemName(String itemName) {
        this.itemName = itemName;
    }
    public Long getItemPriceCents() {
        return itemPriceCents;
    }
    public void setItemPriceCents(Long itemPriceCents) {
        this.itemPriceCents = itemPriceCents;
    }
    public Integer getQuantity() {
        return quantity;
    }
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
