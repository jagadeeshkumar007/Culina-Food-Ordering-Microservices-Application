package com.culina.cart.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.web.client.RestTemplate;

import com.culina.cart.model.Cart;

@Configuration
public class RedisConfig {

    @Bean
    public RedisTemplate<String, Cart> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, Cart> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.setKeySerializer(new StringRedisSerializer());
        return template;
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
