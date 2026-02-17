package com.culina.order.repository;

import com.culina.order.domain.model.Order;
import com.culina.order.domain.model.OrderStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserId(Long userId);

    List<Order> findByChefId(Long chefId);

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Order> findByChefIdAndStatus(Long chefUserId, OrderStatus status);

    List<Order> findByChefIdOrderByCreatedAtDesc(Long chefId);

    List<Order> findByChefIdAndStatusInOrderByCreatedAtDesc(Long chefId, List<OrderStatus> statuses);

    long countByChefId(Long chefId);

    long countByChefIdAndStatus(Long chefId, OrderStatus status);

}
