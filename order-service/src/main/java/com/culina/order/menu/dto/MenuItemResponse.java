package com.culina.order.menu.dto;

import java.time.OffsetDateTime;
import java.util.Base64;

import com.culina.order.menu.model.MenuItem;
import com.fasterxml.jackson.databind.JsonNode;

public class MenuItemResponse {

    private Long id;
    private Long menuId;
    private Long chefId;
    private String name;
    private String description;
    private Long priceCents;
    private String currency;
    private Integer availableQty;
    private Boolean isAvailable;
    private Integer preparationTimeMinutes;
    private String[] tags;
    private JsonNode metadata;
    private String imageBase64;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static MenuItemResponse from(MenuItem item) {
        MenuItemResponse dto = new MenuItemResponse();

        dto.id = item.getId();
        dto.menuId = item.getMenuId();
        dto.chefId = item.getMenu() != null ? item.getMenu().getChefId() : null;
        dto.name = item.getName();
        dto.description = item.getDescription();
        dto.priceCents = item.getPriceCents();
        dto.currency = item.getCurrency();
        dto.availableQty = item.getAvailableQty();
        dto.isAvailable = item.getIsAvailable();
        dto.preparationTimeMinutes = item.getPreparationTimeMinutes();
        dto.tags = item.getTags();
        dto.metadata = item.getMetadata();
        dto.createdAt = item.getCreatedAt();
        dto.updatedAt = item.getUpdatedAt();

        if (item.getImage() != null && item.getImage().length > 0) {
            dto.imageBase64 = Base64.getEncoder().encodeToString(item.getImage());
        }

        return dto;
    }

    /* getters only (no setters needed for response) */
    public Long getId() {
        return id;
    }

    // Also expose as menuItemId for frontend compatibility
    public Long getMenuItemId() {
        return id;
    }

    public Long getMenuId() {
        return menuId;
    }

    public Long getChefId() {
        return chefId;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public Long getPriceCents() {
        return priceCents;
    }

    public String getCurrency() {
        return currency;
    }

    public Integer getAvailableQty() {
        return availableQty;
    }

    public Boolean getIsAvailable() {
        return isAvailable;
    }

    public Integer getPreparationTimeMinutes() {
        return preparationTimeMinutes;
    }

    public String[] getTags() {
        return tags;
    }

    public JsonNode getMetadata() {
        return metadata;
    }

    public String getImageBase64() {
        return imageBase64;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

}
