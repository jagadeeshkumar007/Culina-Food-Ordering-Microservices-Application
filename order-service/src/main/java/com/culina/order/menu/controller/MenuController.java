package com.culina.order.menu.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.culina.order.menu.dto.CreateMenuItemRequest;
import com.culina.order.menu.dto.CreateMenuRequest;
import com.culina.order.menu.dto.MenuItemResponse;
import com.culina.order.menu.model.Menu;
import com.culina.order.menu.model.MenuItem;
import com.culina.order.menu.service.MenuItemService;
import com.culina.order.menu.service.MenuService;

@RestController
@RequestMapping("chefs")
public class MenuController {

    private final MenuService menuService;
    private final MenuItemService menuItemService;

    public MenuController(MenuService menuService, MenuItemService menuItemService) {
        this.menuService = menuService;
        this.menuItemService = menuItemService;
    }

    @GetMapping("/menus")
    public ResponseEntity<List<Menu>> getChefMenus(Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        return ResponseEntity.ok(menuService.getMenusByChef(userId));
    }

    @GetMapping("/menu/{chefId}/menus")
    public ResponseEntity<List<Menu>> getMenusForCustomer(
            @PathVariable Long chefId) {

        return ResponseEntity.ok(menuService.getMenusByChef(chefId));
    }

    @GetMapping("/menu/{menuId}/items")
    public ResponseEntity<List<MenuItemResponse>> getMenuItems(
            @PathVariable Long menuId) {

        return ResponseEntity.ok(menuItemService.getMenuItemsByMenuId(menuId));
    }

    @PostMapping("/menu/createMenu")
    public ResponseEntity<Menu> createMenu(Authentication authentication, @RequestBody CreateMenuRequest request) {
        Long userId = (Long) authentication.getPrincipal();

        Menu menu = menuService.createMenu(userId, request);
        return ResponseEntity.ok(menu);
    }

    @PostMapping(value = "/menu/createItem", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MenuItem> addMenuItem(Authentication authentication,
            @ModelAttribute CreateMenuItemRequest request) {
        Long userId = (Long) authentication.getPrincipal();

        MenuItem menuItem = menuItemService.createOrUpdateMenuItem(userId, request);
        return ResponseEntity.ok(menuItem);
    }

    @PostMapping("/menu/item/{itemId}/availability")
    public ResponseEntity<Void> toggleItemAvailability(
            Authentication authentication,
            @PathVariable Long itemId,
            @RequestParam boolean available) {

        Long chefUserId = (Long) authentication.getPrincipal();
        menuItemService.toggleMenuItemAvailability(chefUserId, itemId, available);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/menu/items/by-ids")
    public ResponseEntity<List<MenuItemResponse>> getItemsByIds(
            @RequestBody List<Long> menuItemIds) {

        return ResponseEntity.ok(
                menuItemService.getMenuItemsByIdsOrdered(menuItemIds));
    }

}
