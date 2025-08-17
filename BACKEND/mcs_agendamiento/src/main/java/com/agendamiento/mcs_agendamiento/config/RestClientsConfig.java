// src/main/java/com/agendamiento/mcs_agendamiento/config/RestClientsConfig.java
package com.agendamiento.mcs_agendamiento.config;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.*; import org.springframework.web.client.RestClient;
@Configuration @EnableConfigurationProperties(ClientsProperties.class)
public class RestClientsConfig {
  @Bean RestClient medicosClient(ClientsProperties p){ return RestClient.builder().baseUrl(p.medicosUrl()).build(); }
  @Bean RestClient pacientesClient(ClientsProperties p){ return RestClient.builder().baseUrl(p.pacientesUrl()).build(); }
}
