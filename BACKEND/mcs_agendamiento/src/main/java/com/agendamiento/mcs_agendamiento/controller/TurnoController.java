package com.agendamiento.mcs_agendamiento.controller;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.agendamiento.mcs_agendamiento.model.Turno;
import com.agendamiento.mcs_agendamiento.service.TurnoService;
import com.fasterxml.jackson.annotation.JsonFormat;

@RestController
@RequestMapping("/api/turnos")
@CrossOrigin(origins = "*")
public class TurnoController {

    private final TurnoService service;

    // 👇 Constructor explícito (sin Lombok)
    public TurnoController(TurnoService service) {
        this.service = service;
    }

    public record CrearTurnoReq(
            Long pacienteId,
            Long medicoId,
            @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm[:ss]") LocalDateTime fechaHora
            ) {

    }

    public record TurnoRes(Long id, Long pacienteId, Long medicoId, LocalDateTime fechaHora, String estado) {

    }

    private TurnoRes map(Turno t) {
        return new TurnoRes(t.getId(), t.getPacienteId(), t.getMedicoId(), t.getFechaHora(), t.getEstado().name());
    }

    @PostMapping({"", "/"})
    @ResponseStatus(HttpStatus.CREATED)
    public TurnoRes crear(@RequestBody CrearTurnoReq r) {
        Turno t = service.crearTurno(r.pacienteId(), r.medicoId(), r.fechaHora());
        return map(t);
    }

    @GetMapping("/{id}")
    public TurnoRes get(@PathVariable Long id) {
        return map(service.obtener(id));
    }

    @GetMapping({"", "/"})
    public Page<TurnoRes> listar(
            @RequestParam Optional<Long> pacienteId,
            @RequestParam Optional<Long> medicoId,
            @RequestParam Optional<String> estado,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Optional<LocalDateTime> desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Optional<LocalDateTime> hasta,
            Pageable pageable) {
        return service.buscar(pacienteId, medicoId, estado, desde, hasta, pageable).map(this::map);
    }

    @PatchMapping("/{id}/confirmar")
    public TurnoRes confirmar(@PathVariable Long id) {
        return map(service.confirmar(id));
    }

    @PatchMapping("/{id}/cancelar")
    public TurnoRes cancelar(@PathVariable Long id) {
        return map(service.cancelar(id));
    }
}
