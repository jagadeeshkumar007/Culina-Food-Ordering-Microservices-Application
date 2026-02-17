package com.culina.order.domain;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

import com.culina.order.domain.model.OrderStatus;

public final class OrderStateMachine {

        private static final Map<OrderStatus, Set<OrderStatus>> transitions = new EnumMap<>(OrderStatus.class);

        static {
                transitions.put(OrderStatus.CREATED,
                                EnumSet.of(OrderStatus.PAID, OrderStatus.CANCELLED));

                transitions.put(OrderStatus.PAID,
                                EnumSet.of(OrderStatus.CONFIRMED, OrderStatus.CANCELLED));
                transitions.put(OrderStatus.CONFIRMED,
                                EnumSet.of(OrderStatus.PREPARING, OrderStatus.CANCELLED));

                transitions.put(OrderStatus.PREPARING,
                                EnumSet.of(OrderStatus.READY));

                transitions.put(OrderStatus.READY,
                                EnumSet.of(OrderStatus.DELIVERED));

                transitions.put(OrderStatus.DELIVERED,
                                EnumSet.noneOf(OrderStatus.class));

                transitions.put(OrderStatus.CANCELLED,
                                EnumSet.noneOf(OrderStatus.class));
        }

        private OrderStateMachine() {
        }

        public static boolean canTransition(
                        OrderStatus current,
                        OrderStatus next) {
                return transitions
                                .getOrDefault(current, EnumSet.noneOf(OrderStatus.class))
                                .contains(next);
        }
}
