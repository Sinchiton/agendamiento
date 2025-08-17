package com.agendamiento.mcs_agendamiento.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import com.agendamiento.mcs_agendamiento.model.EstadoTurno;
import com.agendamiento.mcs_agendamiento.model.Turno;
import com.agendamiento.mcs_agendamiento.repository.TurnoRepository;

@Service
public class TurnoService {

    // En el query param a Médicos mandamos solo hasta minutos
    private static final DateTimeFormatter QP_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");

    private final TurnoRepository repo;
    private final RestClient medicosClient, pacientesClient;
    private final RabbitTemplate rabbit;

    @Value("${app.rabbit.exchange}")
    private String exchange;
    @Value("${app.rabbit.routing.citaConfirmada}")
    private String rkCita;

    public TurnoService(TurnoRepository repo, RestClient medicosClient,
            RestClient pacientesClient, RabbitTemplate rabbit) {
        this.repo = repo;
        this.medicosClient = medicosClient;
        this.pacientesClient = pacientesClient;
        this.rabbit = rabbit;
    }

    public record CitaConfirmadaEvent(Long turnoId, Long pacienteId, Long medicoId, LocalDateTime fechaHora) {

    }

    public Turno crearTurno(Long pacienteId, Long medicoId, LocalDateTime fechaHora) {

        // 1) Paciente debe existir
        try {
            pacientesClient.get()
                    .uri("/api/pacientes/{id}", pacienteId)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientResponseException ex) {
            // 404/400 -> exponemos un error claro al cliente
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Paciente no encontrado: " + pacienteId + " (" + ex.getStatusCode() + ")");
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "No se pudo consultar Pacientes", ex);
        }

        // 2) Médico disponible (formateamos la fecha en el query param)
        Boolean ok;
        try {
            String fhParam = QP_FMT.format(fechaHora.truncatedTo(ChronoUnit.MINUTES));
            ok = medicosClient.get()
                    .uri(uri -> uri.path("/api/medicos/{id}/disponible")
                    .queryParam("fechaHora", fhParam)
                    .build(medicoId))
                    .retrieve()
                    .body(Boolean.class);
        } catch (RestClientResponseException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Error validando médico " + medicoId + " (" + ex.getStatusCode() + ")", ex);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "No se pudo consultar Médicos", ex);
        }

        if (Boolean.FALSE.equals(ok)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Médico no disponible");
        }

        // 3) No duplicar turno exacto
        repo.findByMedicoIdAndFechaHora(medicoId, fechaHora).ifPresent(t -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Turno ocupado");
        });

        // 4) Persistir y publicar evento
        Turno t = new Turno();
        t.setPacienteId(pacienteId);
        t.setMedicoId(medicoId);
        t.setFechaHora(fechaHora);
        t.setEstado(EstadoTurno.CONFIRMADO);
        t.setCreadoEn(LocalDateTime.now());
        t = repo.save(t);

        rabbit.convertAndSend(exchange, rkCita,
                new CitaConfirmadaEvent(t.getId(), pacienteId, medicoId, fechaHora));

        return t;
    }
}
