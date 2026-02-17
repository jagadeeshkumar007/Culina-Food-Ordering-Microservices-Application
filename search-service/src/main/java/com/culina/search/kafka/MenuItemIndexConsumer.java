package com.culina.search.kafka;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import com.culina.search.document.MenuItemDocument;
import com.culina.search.dto.MenuItemEvent;
import com.culina.search.repository.MenuItemSearchRepository;

@Component
public class MenuItemIndexConsumer {

    private final MenuItemSearchRepository repository;

    public MenuItemIndexConsumer(MenuItemSearchRepository repository) {
        this.repository = repository;
    }

    @KafkaListener(
        topics = "menu.item.upsert",
        groupId = "search-service"
    )
    public void consume(MenuItemEvent event) {

        MenuItemDocument doc = new MenuItemDocument();

        doc.setMenuItemId(event.getMenuItemId());
        doc.setName(event.getName());
        doc.setDescription(event.getDescription());
        doc.setPriceCents(event.getPriceCents());
        doc.setIsAvailable(event.getIsAvailable());

        doc.setChefId(event.getChefId());
        doc.setChefName(event.getChefName());

        doc.setMenuName(event.getMenuName());
        doc.setTags(event.getTags());

        repository.save(doc);
    }
}
