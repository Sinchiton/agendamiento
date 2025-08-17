package com.agendamiento.mcs_notificaciones.messaging;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.agendamiento.mcs_notificaciones.service.NotificacionService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CitaConfirmadaListener {

    private static final Logger log = LoggerFactory.getLogger(CitaConfirmadaListener.class);
    private final NotificacionService service;

    public record CitaConfirmadaEvent(Long turnoId, Long pacienteId, Long medicoId, LocalDateTime fechaHora) {

    }

    @RabbitListener(queues = "${app.rabbit.queue.citaConfirmada}")
    public void onEvent(CitaConfirmadaEvent e) {
        log.info("Evento cita.confirmada -> turno {} paciente {} médico {} {}", e.turnoId(), e.pacienteId(), e.medicoId(), e.fechaHora());
        service.guardar("Turno confirmado #" + e.turnoId() + " " + e.fechaHora());
    }
}
