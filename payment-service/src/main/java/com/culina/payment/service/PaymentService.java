package com.culina.payment.service;

import org.springframework.stereotype.Service;

import com.culina.payment.event.OrderConfirmedEvent;
import com.culina.payment.event.PaymentEvent;
import com.culina.payment.kafka.PaymentEventPublisher;
import com.culina.payment.model.Payment;
import com.culina.payment.model.PaymentStatus;
import com.culina.payment.repository.PaymentRepository;

import jakarta.transaction.Transactional;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentEventPublisher eventPublisher;

    public PaymentService(
            PaymentRepository paymentRepository,
            PaymentEventPublisher eventPublisher) {
        this.paymentRepository = paymentRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public void processPayment(OrderConfirmedEvent event) {

        if (paymentRepository.existsByOrderId(event.getOrderId())) {
            return;
        }

        Payment payment = new Payment();
        payment.setOrderId(event.getOrderId());
        payment.setUserId(event.getUserId());
        payment.setAmountCents(event.getTotalAmountCents());
        payment.setStatus(PaymentStatus.INITIATED);

        paymentRepository.save(payment);

        // MOCK PAYMENT GATEWAY
        boolean success = true; // simulate

        payment.setStatus(success ? PaymentStatus.SUCCESS : PaymentStatus.FAILED);
        paymentRepository.save(payment);
        System.out.println("payment success; "+success);
        // EMIT EVENT
        eventPublisher.publish(
                success ? "payment.success" : "payment.failed",
                new PaymentEvent(
                        payment.getOrderId(),
                        payment.getUserId(),
                        payment.getStatus(),
                        payment.getAmountCents()));
    }

}
