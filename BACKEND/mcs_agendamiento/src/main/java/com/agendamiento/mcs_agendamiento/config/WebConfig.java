// src/main/java/com/agendamiento/mcs_agendamiento/config/WebConfig.java
package com.agendamiento.mcs_agendamiento.config;
import org.springframework.context.annotation.*; import org.springframework.web.servlet.config.annotation.*;
@Configuration public class WebConfig {
  @Bean public WebMvcConfigurer cors(){ return new WebMvcConfigurer(){
    @Override public void addCorsMappings(CorsRegistry r){ r.addMapping("/**").allowedOriginPatterns("*").allowedMethods("*").allowedHeaders("*"); }
  }; }
}
