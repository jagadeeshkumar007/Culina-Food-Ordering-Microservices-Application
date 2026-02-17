package com.culina.search.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.culina.search.dto.MenuItem;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByMenuIdAndIsAvailableTrue(Long menuId);

    List<MenuItem> findByMenuId(Long menuId);
}

