package com.agendamiento.mcs_agendamiento.controller;

import java.time.LocalDateTime;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.agendamiento.mcs_agendamiento.model.Turno;
import com.agendamiento.mcs_agendamiento.service.TurnoService;

import jakarta.validation.constraints.NotNull;

@RestController
@RequestMapping("/api/turnos")
public class TurnoController {

    private final TurnoService service;

    public TurnoController(TurnoService service) {
        this.service = service;
    }

    public record CrearTurnoReq(
            @NotNull Long pacienteId,
            @NotNull Long medicoId,
            @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaHora) {}

    public record TurnoRes(Long id, Long pacienteId, Long medicoId, LocalDateTime fechaHora, String estado) {}

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TurnoRes crear(@RequestBody CrearTurnoReq r) {
        Turno t = service.crearTurno(r.pacienteId(), r.medicoId(), r.fechaHora());
        return new TurnoRes(t.getId(), t.getPacienteId(), t.getMedicoId(), t.getFechaHora(), t.getEstado().name());
    }
}
