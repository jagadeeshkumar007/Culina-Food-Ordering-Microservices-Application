package com.culina.order.event;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import com.culina.order.chef.model.Chef;
import com.culina.order.menu.model.Menu;
import com.culina.order.menu.model.MenuItem;

@Component
public class MenuItemEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public MenuItemEventPublisher(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishUpsert(MenuItem menuItem, Chef chef, Menu menu) {

        MenuItemEvent event = new MenuItemEvent();
        event.setMenuItemId(menuItem.getId());
        event.setName(menuItem.getName());
        event.setDescription(menuItem.getDescription());
        event.setPriceCents(menuItem.getPriceCents());
        event.setIsAvailable(menuItem.getIsAvailable());

        event.setChefId(chef.getId());
        event.setChefName(chef.getDisplayName());

        event.setMenuId(menu.getId());
        event.setMenuName(menu.getTitle());

        event.setTags(menuItem.getTags());

        kafkaTemplate.send("menu.item.upsert", event);
    }
}
