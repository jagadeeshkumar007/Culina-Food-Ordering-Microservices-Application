package com.culina.payment.kafka;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import com.culina.payment.event.PaymentEvent;

@Component
public class PaymentEventPublisher {

    private final KafkaTemplate<String, PaymentEvent> kafkaTemplate;

    public PaymentEventPublisher(KafkaTemplate<String, PaymentEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publish(String topic, PaymentEvent event) {
        kafkaTemplate.send(topic, event.getOrderId().toString(), event);
    }
}
