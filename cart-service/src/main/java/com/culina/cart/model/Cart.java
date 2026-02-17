package com.culina.cart.model;

import java.util.HashMap;
import java.util.Map;
import java.util.Collection;
import java.util.ArrayList;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Cart {

    private Long userId;
    private Map<Long, CartItem> itemsMap = new HashMap<>();

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    @JsonIgnore
    public Map<Long, CartItem> getItemsMap() {
        return itemsMap;
    }

    @JsonIgnore
    public void setItemsMap(Map<Long, CartItem> itemsMap) {
        this.itemsMap = itemsMap;
    }

    @JsonProperty("items")
    public Collection<CartItem> getItems() {
        return new ArrayList<>(itemsMap.values());
    }

    @JsonProperty("items")
    public void setItems(Collection<CartItem> items) {
        this.itemsMap.clear();
        if (items != null) {
            for (CartItem item : items) {
                this.itemsMap.put(item.getMenuItemId(), item);
            }
        }
    }

    public void addOrUpdateItem(CartItem item) {
        Long menuItemId = item.getMenuItemId();
        if (itemsMap.containsKey(menuItemId)) {
            CartItem existing = itemsMap.get(menuItemId);
            existing.setQuantity(existing.getQuantity() + item.getQuantity());
        } else {
            itemsMap.put(menuItemId, item);
        }
    }

    public void removeItem(Long menuItemId) {
        itemsMap.remove(menuItemId);
    }

    public void updateQuantity(Long menuItemId, int quantity) {
        if (itemsMap.containsKey(menuItemId)) {
            if (quantity <= 0) {
                itemsMap.remove(menuItemId);
            } else {
                itemsMap.get(menuItemId).setQuantity(quantity);
            }
        }
    }

    public void clear() {
        itemsMap.clear();
    }

    @JsonIgnore
    public boolean isEmpty() {
        return itemsMap.isEmpty();
    }
}
