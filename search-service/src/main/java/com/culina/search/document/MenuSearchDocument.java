package com.culina.search.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;

@Document(indexName = "menus")
public class MenuSearchDocument {

    @Id
    private String id; 

    private Long chefId;
    private String chefName;

    private Long menuItemId;
    private String itemName;

    private String[] tags;
    private Long priceCents;

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public String[] getTags() {
        return tags;
    }

    public void setTags(String[] tags) {
        this.tags = tags;
    }

    public Long getPriceCents() {
        return priceCents;
    }

    public void setPriceCents(Long priceCents) {
        this.priceCents = priceCents;
    }
}
