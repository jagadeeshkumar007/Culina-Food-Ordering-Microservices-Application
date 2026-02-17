package com.culina.order.admin.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.culina.order.chef.model.Chef;
import com.culina.order.chef.service.ChefService;

@RestController
@RequestMapping("/admin/chefs")
public class AdminChefController {

    private final ChefService chefService;

    public AdminChefController(ChefService chefService) {
        this.chefService = chefService;
    }

    @GetMapping
    public ResponseEntity<List<Chef>> getChefsByStatus(
            @RequestParam String status,
            Authentication authentication) {
        System.out.println("Authorities: " + authentication.getAuthorities());
        return ResponseEntity.ok(
                chefService.getChefsByStatus(status));
    }

    @PostMapping("/{chefId}/approve")
    public ResponseEntity<Void> approveChef(@PathVariable Long chefId) {
        chefService.approveChef(chefId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{chefId}/reject")
    public ResponseEntity<Void> rejectChef(@PathVariable Long chefId) {
        chefService.rejectChef(chefId);
        return ResponseEntity.ok().build();
    }
}
