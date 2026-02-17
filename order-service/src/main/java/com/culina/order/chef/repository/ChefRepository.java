package com.culina.order.chef.repository;

import com.culina.order.chef.model.Chef;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChefRepository extends JpaRepository<Chef, Long> {

    Optional<Chef> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    List<Chef> findByVerificationStatusAndIsActive(String verificationStatus, Boolean active);

    List<Chef> findByVerificationStatus(String status);

}
