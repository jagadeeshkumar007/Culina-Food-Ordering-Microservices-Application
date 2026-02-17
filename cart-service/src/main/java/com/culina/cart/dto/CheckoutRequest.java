package com.culina.cart.dto;

public class CheckoutRequest {

    private Long chefId;
    private String currency = "INR";

    public Long getChefId() {
        return chefId;
    }

    public void setChefId(Long chefId) {
        this.chefId = chefId;
    }

    public String getCurrency() {
        return currency;
    }
    public void setCurrency(String currency){
        this.currency = currency;
    }
}
