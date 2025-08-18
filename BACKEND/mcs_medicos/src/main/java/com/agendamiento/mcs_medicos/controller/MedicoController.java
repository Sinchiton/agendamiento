// BACKEND/mcs_medicos/src/main/java/com/agendamiento/mcs_medicos/controller/MedicoController.java
package com.agendamiento.mcs_medicos.controller;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.agendamiento.mcs_medicos.model.HorarioMedico;
import com.agendamiento.mcs_medicos.model.Medico;
import com.agendamiento.mcs_medicos.repository.HorarioMedicoRepository;
import com.agendamiento.mcs_medicos.repository.MedicoRepository;
import com.agendamiento.mcs_medicos.service.DisponibilidadMedicoService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/medicos")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class MedicoController {

    private final MedicoRepository repo;
    private final HorarioMedicoRepository horarios;
    private final DisponibilidadMedicoService dispSvc;

    // ------- CRUD Médico (igual que lo tenías) -------
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
        return repo.findById(id).orElseThrow(()
                -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Médico no existe"));
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
    public void eliminar(@PathVariable Long id) {
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Médico no existe");
        }
        horarios.deleteByMedicoId(id);
        repo.deleteById(id);
    }

    // ------- Horarios del médico -------
    public record HorarioReq(String dia, String inicio, String fin) {

    } // "MONDAY","08:00","12:00"

    @GetMapping("/{id}/horarios")
    public List<HorarioMedico> listarHorarios(@PathVariable Long id) {
        get(id); // valida existencia
        // devolver todos es simple; podrías filtrar por día también si quieres
        return horarios.findAll().stream().filter(h -> h.getMedico().getId().equals(id)).toList();
    }

    @PutMapping("/{id}/horarios") // reemplaza horarios
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reemplazarHorarios(@PathVariable Long id, @RequestBody List<HorarioReq> body) {
        Medico m = get(id);
        horarios.deleteByMedicoId(id);
        for (HorarioReq r : body) {
            horarios.save(HorarioMedico.builder()
                    .medico(m)
                    .dia(DayOfWeek.valueOf(r.dia().toUpperCase()))
                    .horaInicio(LocalTime.parse(r.inicio()))
                    .horaFin(LocalTime.parse(r.fin()))
                    .build());
        }
    }

    // ------- Disponibilidad & sugerencia -------
    public record DisponibilidadRes(boolean disponible, LocalDateTime sugerido) {

    }

    /**
     * Backcompat: solo boolean
     */
    @GetMapping("/{id}/disponible")
    public Boolean disponible(@PathVariable Long id,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(
                    pattern = "yyyy-MM-dd'T'HH:mm[:ss]") LocalDateTime fechaHora) {
        return dispSvc.disponibilidad(id, fechaHora, 30).disponible();
    }

    /**
     * Nuevo: con sugerencia de próximo espacio de agenda
     */
    @GetMapping("/{id}/disponibilidad")
    public DisponibilidadRes disponibilidad(@PathVariable Long id,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(
                    pattern = "yyyy-MM-dd'T'HH:mm[:ss]") LocalDateTime fechaHora,
            @RequestParam(defaultValue = "30") int slotMin) {
        var d = dispSvc.disponibilidad(id, fechaHora, slotMin);
        return new DisponibilidadRes(d.disponible(), d.sugerido());
    }
}
