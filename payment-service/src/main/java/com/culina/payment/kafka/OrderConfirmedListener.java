package com.culina.payment.kafka;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.culina.payment.event.OrderConfirmedEvent;
import com.culina.payment.service.PaymentService;

@Component
public class OrderConfirmedListener {

    private PaymentService paymentService;

    public OrderConfirmedListener(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @Transactional
    @KafkaListener(
        topics = "order.confirmed",
        groupId = "payment-service"
    )
    public void handle(OrderConfirmedEvent event) {
        paymentService.processPayment(event);
    }
}
