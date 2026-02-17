package com.culina.order.menu.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.culina.order.menu.model.Menu;

public interface MenuRepository extends JpaRepository<Menu, Long> {
   
    List<Menu> findAllByChefIdAndIsActiveTrue(Long chefId);
    Optional<Menu> findByIdAndChefIdAndIsActiveTrue(Long id, Long chefId);
}

