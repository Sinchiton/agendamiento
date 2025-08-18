package com.agendamiento.mcs_agendamiento.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
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
    private static final DateTimeFormatter QP_FMT
            = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm", Locale.ROOT);

    private final TurnoRepository repo;
    private final RestClient medicosClient;
    private final RestClient pacientesClient;
    private final RabbitTemplate rabbit;

    @Value("${app.rabbit.exchange}")
    private String exchange;

    @Value("${app.rabbit.routing.citaConfirmada}")
    private String rkCita;

    // 👇 Constructor explícito (sin Lombok)
    public TurnoService(TurnoRepository repo,
            RestClient medicosClient,
            RestClient pacientesClient,
            RabbitTemplate rabbit) {
        this.repo = repo;
        this.medicosClient = medicosClient;
        this.pacientesClient = pacientesClient;
        this.rabbit = rabbit;
    }

    /**
     * Payload del evento que consumirá mcs_notificaciones
     */
    public record CitaConfirmadaEvent(
            Long turnoId, Long pacienteId, Long medicoId, LocalDateTime fechaHora) {

    }

    /**
     * Crea un turno: valida Paciente y disponibilidad de Médico, evita
     * duplicados y publica evento.
     */
    public Turno crearTurno(Long pacienteId, Long medicoId, LocalDateTime fechaHora) {

        // 1) Paciente debe existir
        try {
            pacientesClient.get()
                    .uri("/api/pacientes/{id}", pacienteId)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientResponseException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Paciente no encontrado: " + pacienteId + " (" + ex.getStatusCode() + ")"
            );
        } catch (Exception ex) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE, "No se pudo consultar Pacientes", ex
            );
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
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Error validando médico " + medicoId + " (" + ex.getStatusCode() + ")",
                    ex
            );
        } catch (Exception ex) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE, "No se pudo consultar Médicos", ex
            );
        }

        if (Boolean.FALSE.equals(ok)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Médico no disponible");
        }

        // 3) No duplicar turno exacto (mismo médico, misma fecha/hora)
        repo.findByMedicoIdAndFechaHora(medicoId, fechaHora).ifPresent(t -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Turno ocupado");
        });

        // 4) Persistir y publicar evento de "confirmado"
        Turno t = new Turno();
        t.setPacienteId(pacienteId);
        t.setMedicoId(medicoId);
        t.setFechaHora(fechaHora);
        t.setEstado(EstadoTurno.CONFIRMADO);
        t.setCreadoEn(LocalDateTime.now());
        t = repo.save(t);

        publicarCitaConfirmada(t);
        return t;
    }

    /**
     * Obtiene un turno por id o 404.
     */
    public Turno obtener(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Turno no existe"));
    }

    /**
     * Búsqueda con filtros + paginación (simple, filtra en memoria).
     */
    public Page<Turno> buscar(
            Optional<Long> pacienteId,
            Optional<Long> medicoId,
            Optional<String> estado,
            Optional<LocalDateTime> desde,
            Optional<LocalDateTime> hasta,
            Pageable pageable
    ) {
        List<Turno> all = repo.findAll();

        List<Turno> filtrados = all.stream()
                .filter(t -> pacienteId.map(v -> Objects.equals(t.getPacienteId(), v)).orElse(true))
                .filter(t -> medicoId.map(v -> Objects.equals(t.getMedicoId(), v)).orElse(true))
                .filter(t -> estado.map(v -> {
            try {
                return t.getEstado().name().equalsIgnoreCase(v);
            } catch (Exception e) {
                return false;
            }
        }).orElse(true))
                .filter(t -> desde.map(v -> !t.getFechaHora().isBefore(v)).orElse(true))
                .filter(t -> hasta.map(v -> !t.getFechaHora().isAfter(v)).orElse(true))
                .toList();

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), filtrados.size());
        List<Turno> content = start >= filtrados.size() ? List.of() : filtrados.subList(start, end);

        return new PageImpl<>(content, pageable, filtrados.size());
    }

    /**
     * Confirma un turno (idempotente).
     */
    public Turno confirmar(Long id) {
        Turno t = obtener(id);
        if (t.getEstado() != EstadoTurno.CONFIRMADO) {
            t.setEstado(EstadoTurno.CONFIRMADO);
            t = repo.save(t);
            publicarCitaConfirmada(t);
        }
        return t;
    }

    /**
     * Cancela un turno (idempotente).
     */
    public Turno cancelar(Long id) {
        Turno t = obtener(id);
        if (t.getEstado() != EstadoTurno.CANCELADO) {
            t.setEstado(EstadoTurno.CANCELADO);
            t = repo.save(t);
            // aquí podrías publicar "cita.cancelada" si quisieras
        }
        return t;
    }

    /* ------------------------------- helpers -------------------------------- */
    private void publicarCitaConfirmada(Turno t) {
        rabbit.convertAndSend(
                exchange,
                rkCita,
                new CitaConfirmadaEvent(t.getId(), t.getPacienteId(), t.getMedicoId(), t.getFechaHora())
        );
    }
}
