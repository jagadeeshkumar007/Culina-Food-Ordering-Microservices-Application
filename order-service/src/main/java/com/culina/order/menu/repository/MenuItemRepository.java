package com.culina.order.menu.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.culina.order.menu.model.MenuItem;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByMenuIdAndIsAvailableTrue(Long menuId);

    @Query("SELECT mi FROM MenuItem mi LEFT JOIN FETCH mi.menu WHERE mi.menuId = :menuId")
    List<MenuItem> findByMenuId(@Param("menuId") Long menuId);

    @Query("SELECT mi FROM MenuItem mi LEFT JOIN FETCH mi.menu WHERE mi.id IN :ids")
    List<MenuItem> findAllByIdWithMenu(@Param("ids") List<Long> ids);
}
