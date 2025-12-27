// BACKEND/mcs_medicos/src/main/java/com/agendamiento/mcs_medicos/controller/MedicoController.java
package com.agendamiento.mcs_medicos.controller;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.agendamiento.mcs_medicos.model.HorarioMedico;
import com.agendamiento.mcs_medicos.model.Medico;
import com.agendamiento.mcs_medicos.repository.HorarioMedicoRepository;
import com.agendamiento.mcs_medicos.repository.MedicoRepository;
import com.agendamiento.mcs_medicos.service.DisponibilidadMedicoService;

@RestController
@RequestMapping("/api/medicos")
@CrossOrigin(origins = "*")
public class MedicoController {

    private final MedicoRepository repo;
    private final HorarioMedicoRepository horarios;
    private final DisponibilidadMedicoService dispSvc;

    // Constructor explícito (sin Lombok)
    public MedicoController(MedicoRepository repo,
                            HorarioMedicoRepository horarios,
                            DisponibilidadMedicoService dispSvc) {
        this.repo = repo;
        this.horarios = horarios;
        this.dispSvc = dispSvc;
    }

    /* ===================== CRUD MÉDICO ===================== */

    @GetMapping({"", "/"})
    public List<Medico> listar() {
        return repo.findAll();
    }

    @PostMapping({"", "/"})
    @ResponseStatus(HttpStatus.CREATED)
    public Medico crear(@RequestBody Medico m) {
        return repo.save(m);
    }

    @GetMapping("/{id}")
    public Medico get(@PathVariable Long id) {
        return repo.findById(id).orElseThrow(
            () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Médico no existe")
        );
    }

    @PutMapping("/{id}")
    public Medico actualizar(@PathVariable Long id, @RequestBody Medico m) {
        Medico db = get(id);
        db.setNombre(m.getNombre());
        db.setEspecialidad(m.getEspecialidad());
        db.setActivo(m.isActivo());
        return repo.save(db);
    }

    @PatchMapping("/{id}/estado")
    public Medico cambiarEstado(@PathVariable Long id, @RequestParam boolean activo) {
        Medico db = get(id);
        db.setActivo(activo);
        return repo.save(db);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void eliminar(@PathVariable Long id) {
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Médico no existe");
        }
        horarios.deleteByMedicoId(id);
        repo.deleteById(id);
    }

    /* ===================== HORARIOS ===================== */

    // DTOs para evitar LAZY initialization al serializar
    public record HorarioReq(String dia, String inicio, String fin) {}
    public record HorarioRes(String dia, String inicio, String fin) {}

    @GetMapping("/{id}/horarios")
    public List<HorarioRes> listarHorarios(@PathVariable Long id) {
        get(id); // valida existencia
        return horarios.findByMedicoId(id).stream()
            .map(h -> new HorarioRes(
                    h.getDia().name(),
                    h.getHoraInicio().toString(),
                    h.getHoraFin().toString()))
            .toList();
    }

    @PutMapping("/{id}/horarios") // reemplaza todos los horarios del médico
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void reemplazarHorarios(@PathVariable Long id, @RequestBody List<HorarioReq> body) {
        Medico m = get(id);
        // borra existentes dentro de transacción
        horarios.deleteByMedicoId(id);

        // crea los nuevos
        for (HorarioReq r : body) {
            DayOfWeek dia;
            LocalTime inicio;
            LocalTime fin;
            try {
                dia = DayOfWeek.valueOf(r.dia().toUpperCase());
                inicio = LocalTime.parse(r.inicio()); // "HH:mm"
                fin = LocalTime.parse(r.fin());
            } catch (IllegalArgumentException | DateTimeParseException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Formato inválido de dia/inicio/fin. Ej: {\"dia\":\"MONDAY\",\"inicio\":\"09:00\",\"fin\":\"17:00\"}");
            }
            if (!inicio.isBefore(fin)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "El horario debe cumplir inicio < fin");
            }
            horarios.save(HorarioMedico.builder()
                    .medico(m)
                    .dia(dia)
                    .horaInicio(inicio)
                    .horaFin(fin)
                    .build());
        }
    }

    /* ===================== DISPONIBILIDAD ===================== */

    public record DisponibilidadRes(boolean disponible, LocalDateTime sugerido) {}

    /**
     * Back-compat: solo booleano
     */
    @GetMapping("/{id}/disponible")
    public Boolean disponible(
            @PathVariable Long id,
            @RequestParam
            @org.springframework.format.annotation.DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm[:ss]")
            LocalDateTime fechaHora) {
        // Nota: evita enviar saltos de línea en el query param (no usar Enter al final)
        return dispSvc.disponibilidad(id, fechaHora, 30).disponible();
    }

    /**
     * Nuevo: con sugerencia del próximo hueco
     */
    @GetMapping("/{id}/disponibilidad")
    public DisponibilidadRes disponibilidad(
            @PathVariable Long id,
            @RequestParam
            @org.springframework.format.annotation.DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm[:ss]")
            LocalDateTime fechaHora,
            @RequestParam(defaultValue = "30") int slotMin) {

        if (slotMin <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "slotMin debe ser > 0");
        }
        var d = dispSvc.disponibilidad(id, fechaHora, slotMin);
        return new DisponibilidadRes(d.disponible(), d.sugerido());
    }
}
