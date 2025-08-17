// src/main/java/com/agendamiento/mcs_agendamiento/config/RestClientsConfig.java
package com.agendamiento.mcs_agendamiento.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties(ClientsProperties.class)
public class RestClientsConfig {

    @Bean
    RestClient medicosClient(ClientsProperties props) {
        return RestClient.builder()
                .baseUrl(props.medicosUrl())
                .build();
    }

    @Bean
    RestClient pacientesClient(ClientsProperties props) {
        return RestClient.builder()
                .baseUrl(props.pacientesUrl())
                .build();
    }
}
