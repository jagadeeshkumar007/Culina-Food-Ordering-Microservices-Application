package com.culina.cart.model;

public class CartItem {

    private Long menuItemId;
    private Long chefId;
    private String name;
    private Long priceCents;
    private int quantity;
    private String chefName;

    // No-arg constructor for Jackson
    public CartItem() {
    }

    public Long getChefId() {
        return chefId;
    }

    public void setChefId(Long chefId) {
        this.chefId = chefId;
    }

    public String getChefName() {
        return chefName;
    }

    public void setChefName(String chefName) {
        this.chefName = chefName;
    }

    // getters & setters
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

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    @Override
    public String toString() {
        return "CartItem{" +
                "menuItemId=" + menuItemId +
                ", chefId=" + chefId +
                ", name='" + name + '\'' +
                ", priceCents=" + priceCents +
                ", quantity=" + quantity +
                ", chefName='" + chefName + '\'' +
                '}';
    }
}
