package com.culina.order.menu.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.culina.order.chef.model.Chef;
import com.culina.order.chef.repository.ChefRepository;
import com.culina.order.menu.dto.CreateMenuRequest;
import com.culina.order.menu.model.Menu;
import com.culina.order.menu.repository.MenuRepository;

import jakarta.transaction.Transactional;

@Service
public class MenuService {

    private final MenuRepository menuRepository;
    private final ChefRepository chefRepository;

    public MenuService(
            MenuRepository menuRepository,
            ChefRepository chefRepository) {
        this.menuRepository = menuRepository;
        this.chefRepository = chefRepository;
    }

    @Transactional
    public Menu createMenu(Long chefUserId, CreateMenuRequest request) {

        Chef chef = chefRepository.findByUserId(chefUserId)
                .orElseThrow(() -> new RuntimeException("Chef not found"));

        if (!chef.getVerificationStatus().equals("APPROVED")) {
            throw new RuntimeException("Chef is not approved to create menus");
        }

        if (Boolean.FALSE.equals(chef.getIsActive())) {
            throw new RuntimeException("Chef is inactive");
        }
        Menu menu;
        if (request.getMenuId() != null && request.getMenuId() > 0) {
            menu = menuRepository.findById(request.getMenuId())
                    .orElseThrow(() -> new RuntimeException("Menu not found"));

            if (!menu.getChefId().equals(chef.getId())) {
                throw new RuntimeException("Unauthorized menu update");
            }

        } else {
            menu = new Menu();
            menu.setChefId(chef.getId());
            menu.setIsActive(true);
        }
        menu.setTitle(request.getTitle());

        return menuRepository.save(menu);
    }

    public List<Menu> getMenusByChef(Long chefUserId) {

        Chef chef = chefRepository.findByUserId(chefUserId)
                .orElseThrow(() -> new RuntimeException("Chef not found"));
        return menuRepository.findAllByChefIdAndIsActiveTrue(chef.getId());
    }

    @Transactional
    public void deactivateMenu(Long chefUserId, Long menuId) {

        Chef chef = chefRepository.findByUserId(chefUserId)
                .orElseThrow(() -> new RuntimeException("Chef not found"));

        Menu menu = menuRepository.findById(menuId)
                .orElseThrow(() -> new RuntimeException("Menu not found"));

        if (!menu.getChefId().equals(chef.getId())) {
            throw new RuntimeException("Chef not authorized for this menu");
        }

        menu.setIsActive(false);
        menuRepository.save(menu);
    }
}
