package com.culina.payment.repository;

import com.culina.payment.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    boolean existsByOrderId(Long orderId);
}

