// src/main/java/com/agendamiento/mcs_agendamiento/config/ClientsProperties.java
package com.agendamiento.mcs_agendamiento.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Mapea: clients.medicos-url=... clients.pacientes-url=...
 */
@ConfigurationProperties(prefix = "clients")
public record ClientsProperties(
        String medicosUrl,
        String pacientesUrl
        ) {

}
