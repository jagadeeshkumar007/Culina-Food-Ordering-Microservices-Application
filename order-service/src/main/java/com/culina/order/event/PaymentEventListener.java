package com.culina.order.event;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import com.culina.order.service.OrderService;

@Component
public class PaymentEventListener {

    private final OrderService orderService;

    public PaymentEventListener(OrderService orderService) {
        this.orderService = orderService;
    }

    @KafkaListener(
        topics = "payment.success",
        groupId = "order-service"
    )
    public void handlePaymentSuccess(PaymentEvent event) {
        System.out.println("markpaid: "+event.getOrderId());
        orderService.markPaid(event.getOrderId());
    }

    @KafkaListener(
        topics = "payment.failed",
        groupId = "order-service"
    )
    public void handlePaymentFailure(PaymentEvent event) {
        orderService.cancelAfterPaymentFailure(event.getOrderId());
    }
}
