package com.culina.payment.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.culina.payment.event.OrderConfirmedEvent;
import com.culina.payment.service.PaymentService;

@RestController
@RequestMapping("/payment")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/pay")
    public ResponseEntity<Void> pay(
            Authentication authentication,
            @RequestBody OrderConfirmedEvent request) {

        Long authUserId = Long.valueOf(authentication.getName());

        // safety check
        if (!authUserId.equals(request.getUserId())) {
            throw new RuntimeException("USER_MISMATCH");
        }

        paymentService.processPayment(request);

        return ResponseEntity.ok().build();
    }
}
