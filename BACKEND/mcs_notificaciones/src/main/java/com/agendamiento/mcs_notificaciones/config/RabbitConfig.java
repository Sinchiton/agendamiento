// src/main/java/com/agendamiento/mcs_notificaciones/config/RabbitConfig.java
package com.agendamiento.mcs_notificaciones.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableRabbit
public class RabbitConfig {

    @Bean
    TopicExchange citasExchange(@Value("${app.rabbit.exchange}") String n) {
        return new TopicExchange(n, true, false);
    }

    @Bean
    Queue citaConfirmadaQueue(@Value("${app.rabbit.queue.citaConfirmada}") String q) {
        return QueueBuilder.durable(q).build();
    }

    @Bean
    Binding binding(Queue q, TopicExchange ex, @Value("${app.rabbit.routing.citaConfirmada}") String rk) {
        return BindingBuilder.bind(q).to(ex).with(rk);
    }

    @Bean
    MessageConverter jsonConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
