package com.culina.order.menu.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.culina.order.chef.model.Chef;
import com.culina.order.chef.repository.ChefRepository;
import com.culina.order.event.MenuItemEventPublisher;
import com.culina.order.menu.dto.CreateMenuItemRequest;
import com.culina.order.menu.dto.MenuItemResponse;
import com.culina.order.menu.model.Menu;
import com.culina.order.menu.model.MenuItem;
import com.culina.order.menu.repository.MenuItemRepository;
import com.culina.order.menu.repository.MenuRepository;

import jakarta.transaction.Transactional;

@Service
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final MenuRepository menuRepository;
    private final ChefRepository chefRepository;
    private final MenuItemEventPublisher eventPublisher;

    public MenuItemService(
            MenuItemRepository menuItemRepository,
            MenuRepository menuRepository,
            ChefRepository chefRepository,
            MenuItemEventPublisher eventPublisher) {
        this.menuItemRepository = menuItemRepository;
        this.menuRepository = menuRepository;
        this.chefRepository = chefRepository;
        this.eventPublisher = eventPublisher;
    }

    public List<MenuItemResponse> getMenuItemsByMenuId(Long menuId) {
        return menuItemRepository.findByMenuId(menuId).stream().map(MenuItemResponse::from).toList();
    }

    @Transactional
    public MenuItem createOrUpdateMenuItem(
            Long chefId,
            CreateMenuItemRequest request) {

        Menu menu = menuRepository.findById(request.getMenuId())
                .orElseThrow(() -> new RuntimeException("Menu not found"));

        Chef chef = chefRepository.findByUserId(chefId)
                .orElseThrow(() -> new RuntimeException("Chef not found"));

        if (!menu.getChefId().equals(chef.getId())) {
            throw new RuntimeException("Chef not authorized for this menu");
        }

        MenuItem menuItem;

        if (request.getMenuItemId() != null) {
            menuItem = menuItemRepository.findById(request.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("Menu item not found"));
        } else {
            menuItem = new MenuItem();
        }

        menuItem.setMenuId(menu.getId());
        menuItem.setName(request.getName());
        menuItem.setDescription(request.getDescription());
        menuItem.setPriceCents(request.getPriceCents());
        menuItem.setPreparationTimeMinutes(request.getPreparationTimeMinutes());
        menuItem.setAvailableQty(request.getAvailableQty());
        menuItem.setIsAvailable(Boolean.TRUE);
        menuItem.setTags(request.getTags());
        menuItem.setMetadata(request.getMetadata());

        // CRITICAL FIX: Handle image upload
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            try {
                byte[] imageBytes = request.getImage().getBytes();
                menuItem.setImage(imageBytes);
                System.out.println("Image saved: " + imageBytes.length + " bytes");
            } catch (IOException e) {
                System.err.println("Error reading image file: " + e.getMessage());
                throw new RuntimeException("Failed to process image", e);
            }
        } else {
            System.out.println("No image provided in request");
            // If updating and no new image provided, keep the existing image
            // (it won't be overwritten since we're not calling setImage)
        }

        MenuItem saved = menuItemRepository.save(menuItem);

        eventPublisher.publishUpsert(saved, chef, menu);

        return saved;
    }

    @Transactional
    public void toggleMenuItemAvailability(Long chefUserId, Long menuItemId, boolean available) {

        Chef chef = chefRepository.findByUserId(chefUserId)
                .orElseThrow(() -> new RuntimeException("Chef not found"));

        MenuItem item = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        Menu menu = menuRepository.findById(item.getMenuId())
                .orElseThrow(() -> new RuntimeException("Menu not found"));

        if (!menu.getChefId().equals(chef.getId())) {
            throw new RuntimeException("Chef not authorized for this item");
        }

        item.setIsAvailable(available);
        menuItemRepository.save(item);
    }

    public List<MenuItemResponse> getMenuItemsByIdsOrdered(List<Long> orderedIds) {

        Map<Long, MenuItem> itemMap = menuItemRepository.findAllByIdWithMenu(orderedIds)
                .stream()
                .collect(Collectors.toMap(
                        MenuItem::getId,
                        Function.identity()));

        List<MenuItemResponse> result = new ArrayList<>();

        for (Long id : orderedIds) {
            MenuItem item = itemMap.get(id);
            if (item != null) {
                result.add(MenuItemResponse.from(item));
            }
        }

        return result;
    }

}