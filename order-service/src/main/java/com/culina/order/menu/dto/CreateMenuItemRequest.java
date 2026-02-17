package com.culina.order.menu.dto;

import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.JsonNode;

public class CreateMenuItemRequest {

    private Long menuId;
    private String name;
    private Long priceCents;

    private Long menuItemId;
    private Integer preparationTimeMinutes;
    private String description;
    private Integer availableQty;
    private String[] tags;
    private JsonNode metadata;
    private MultipartFile image;

    // ---------- getters & setters ----------

    public Long getMenuId() {
        return menuId;
    }

    public void setMenuId(Long menuId) {
        this.menuId = menuId;
    }

    public Long getMenuItemId() {
        return menuItemId;
    }

    public void setMenuItemId(Long menuItemId) {
        this.menuItemId = menuItemId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getPriceCents() {
        return priceCents;
    }

    public void setPriceCents(Long priceCents) {
        this.priceCents = priceCents;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getAvailableQty() {
        return availableQty;
    }

    public void setAvailableQty(Integer availableQty) {
        this.availableQty = availableQty;
    }

    public String[] getTags() {
        return tags;
    }

    public void setTags(String[] tags) {
        this.tags = tags;
    }

    public JsonNode getMetadata() {
        return metadata;
    }

    public void setMetadata(JsonNode metadata) {
        this.metadata = metadata;
    }

    public Integer getPreparationTimeMinutes() {
        return preparationTimeMinutes;
    }

    public void setPreparationTimeMinutes(Integer preparationTimeMinutes) {
        this.preparationTimeMinutes = preparationTimeMinutes;
    }

    public MultipartFile getImage() {
        return image;
    }

    public void setImage(MultipartFile image) {
        this.image = image;
    }
}
