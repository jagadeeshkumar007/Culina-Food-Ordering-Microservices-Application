package com.culina.order.chef.controller;

import com.culina.order.chef.dto.ChefOnboardRequest;
import com.culina.order.chef.dto.ChefOrderStatsResponse;
import com.culina.order.chef.model.Chef;
import com.culina.order.chef.repository.ChefRepository;
import com.culina.order.chef.service.ChefService;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/chefs")
public class ChefController {

    private final ChefService chefService;
    private final ChefRepository chefRepository;

    public ChefController(ChefService chefService, ChefRepository chefRepository) {
        this.chefService = chefService;
        this.chefRepository = chefRepository;
    }

    @GetMapping("/active")
    public List<Chef> getChefs() {
        return chefService.getAllChefs();
    }

    @GetMapping("/me/orders/stats")
    public ResponseEntity<ChefOrderStatsResponse> getOrderStats(
            Authentication authentication) {
        Long chefUserId = Long.valueOf(authentication.getName());
        return ResponseEntity.ok(
                chefService.getOrderStats(chefUserId));
    }

    @GetMapping("/me")
    public ResponseEntity<Chef> me(Authentication auth) {
        Long userId = Long.valueOf(auth.getName());
        return chefRepository.findByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/me/active")
    public ResponseEntity<Void> setActive(
            Authentication authentication,
            @RequestParam boolean active) {

        Long userId = Long.valueOf(authentication.getName());
        chefService.setActive(userId, active);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/onboard")
    public ResponseEntity<Chef> onboardChef(
            Authentication authentication,
            @RequestBody ChefOnboardRequest request) {

        Long userId = Long.valueOf(authentication.getName());

        Chef chef = chefService.onboardChef(
                userId,
                request.getDisplayName(),
                request.getKitchenName(),
                request.getDescription(),
                request.getCuisineType());

        return ResponseEntity.ok(chef);
    }

}
