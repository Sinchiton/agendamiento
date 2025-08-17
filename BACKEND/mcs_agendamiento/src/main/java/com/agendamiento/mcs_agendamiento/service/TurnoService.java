package com.agendamiento.mcs_agendamiento.service;

import java.time.LocalDateTime;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import com.agendamiento.mcs_agendamiento.model.EstadoTurno;
import com.agendamiento.mcs_agendamiento.model.Turno;
import com.agendamiento.mcs_agendamiento.repository.TurnoRepository;

@Service
public class TurnoService {

    private final TurnoRepository repo;
    private final RestClient medicosClient;
    private final RestClient pacientesClient;
    private final RabbitTemplate rabbit;

    @Value("${app.rabbit.exchange}")
    private String exchange;

    @Value("${app.rabbit.routing.citaConfirmada}")
    private String rkCita;

    public TurnoService(
            TurnoRepository repo,
            RestClient medicosClient,
            RestClient pacientesClient,
            RabbitTemplate rabbit) {
        this.repo = repo;
        this.medicosClient = medicosClient;
        this.pacientesClient = pacientesClient;
        this.rabbit = rabbit;
    }

    public record CitaConfirmadaEvent(Long turnoId, Long pacienteId, Long medicoId, LocalDateTime fechaHora) {}

    public Turno crearTurno(Long pacienteId, Long medicoId, LocalDateTime fechaHora) {
        // valida paciente
        pacientesClient.get().uri("/api/pacientes/{id}", pacienteId).retrieve().toBodilessEntity();

        // disponibilidad médico
        Boolean ok = medicosClient.get()
                .uri("/api/medicos/{id}/disponible?fechaHora={fh}", medicoId, fechaHora)
                .retrieve().body(Boolean.class);
        if (Boolean.FALSE.equals(ok)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Médico no disponible");
        }

        // choque de turno
        repo.findByMedicoIdAndFechaHora(medicoId, fechaHora).ifPresent(t -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Turno ocupado");
        });

        // persistir
        Turno t = new Turno();
        t.setPacienteId(pacienteId);
        t.setMedicoId(medicoId);
        t.setFechaHora(fechaHora);
        t.setEstado(EstadoTurno.CONFIRMADO);
        t.setCreadoEn(LocalDateTime.now());
        t = repo.save(t);

        // publicar evento
        rabbit.convertAndSend(exchange, rkCita, new CitaConfirmadaEvent(t.getId(), pacienteId, medicoId, fechaHora));
        return t;
    }
}
