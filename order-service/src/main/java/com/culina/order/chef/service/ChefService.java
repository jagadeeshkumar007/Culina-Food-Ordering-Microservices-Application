package com.culina.order.chef.service;

import com.culina.order.chef.dto.ChefOrderStatsResponse;
import com.culina.order.chef.model.Chef;
import com.culina.order.chef.repository.ChefRepository;
import com.culina.order.domain.model.OrderStatus;
import com.culina.order.repository.OrderRepository;

import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ChefService {

    private final ChefRepository chefRepository;
    private final OrderRepository orderRepository;

    public ChefService(ChefRepository chefRepository, OrderRepository orderRepository) {
        this.chefRepository = chefRepository;
        this.orderRepository = orderRepository;
    }

    public List<Chef> getAllChefs() {
        return chefRepository.findByVerificationStatusAndIsActive("APPROVED", true);
    }

    public List<Chef> getChefsByStatus(String status) {
        return chefRepository.findByVerificationStatus(status);
    }

    public List<Chef> getAllPendingChefs() {
        return chefRepository.findByVerificationStatusAndIsActive("PENDING", true);
    }

    @Transactional
    public void setActive(Long userId, boolean active) {

        Chef chef = chefRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("CHEF_PROFILE_NOT_FOUND"));

        if (!chef.getVerificationStatus().equals("APPROVED")) {
            throw new RuntimeException("CHEF_NOT_APPROVED");
        }

        chef.setIsActive(active);
        chef.setLastActiveAt(OffsetDateTime.now());

        chefRepository.save(chef);
    }

    @Transactional
    public Chef onboardChef(
            Long userId,
            String displayName,
            String kitchenName,
            String description,
            String cuisineType) {

        // Check if chef already exists
        Chef chef = chefRepository.findByUserId(userId).orElse(null);

        if (chef != null) {
            // UPDATE existing chef profile
            chef.setDisplayName(displayName);
            chef.setKitchenName(kitchenName);
            chef.setDescription(description);
            chef.setCuisineType(cuisineType);
            // Don't change verification status or isActive on update
        } else {
            // CREATE new chef
            chef = new Chef();
            chef.setUserId(userId);
            chef.setDisplayName(displayName);
            chef.setKitchenName(kitchenName);
            chef.setDescription(description);
            chef.setCuisineType(cuisineType);
            chef.setVerificationStatus("PENDING");
            chef.setIsActive(true);
        }

        return chefRepository.save(chef);
    }

    @Transactional(readOnly = true)
    public ChefOrderStatsResponse getOrderStats(Long chefUserId) {

        Chef chef = chefRepository.findByUserId(chefUserId)
                .orElseThrow(() -> new RuntimeException("Chef not found"));

        Long chefId = chef.getId();

        long total = orderRepository.countByChefId(chefId);
        long pending = orderRepository.countByChefIdAndStatus(chefId, OrderStatus.CONFIRMED);
        long preparing = orderRepository.countByChefIdAndStatus(chefId, OrderStatus.PREPARING);
        long ready = orderRepository.countByChefIdAndStatus(chefId, OrderStatus.READY);

        return new ChefOrderStatsResponse(
                total,
                pending,
                preparing,
                ready);
    }

    public void approveChef(Long chefId) {
        Chef chef = chefRepository.findById(chefId)
                .orElseThrow(() -> new RuntimeException("CHEF_NOT_FOUND"));

        chef.setVerificationStatus("APPROVED");
        chefRepository.save(chef);
    }

    public void rejectChef(Long chefId) {
        Chef chef = chefRepository.findById(chefId)
                .orElseThrow(() -> new RuntimeException("CHEF_NOT_FOUND"));

        chef.setVerificationStatus("REJECTED");
        chefRepository.save(chef);
    }
}
