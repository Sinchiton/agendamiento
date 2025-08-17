package com.agendamiento.mcs_notificaciones.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.agendamiento.mcs_notificaciones.model.Notificacion;
import com.agendamiento.mcs_notificaciones.repository.NotifRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificacionService {

    private final NotifRepository repo;

    public void guardar(String mensaje) {
        repo.save(Notificacion.builder()
                .destinatario("PACIENTE").canal("EMAIL").mensaje(mensaje).enviadoEn(LocalDateTime.now()).estado("ENVIADA").build());
    }
}
