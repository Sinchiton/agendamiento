package com.agendamiento.mcs_medicos.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import com.agendamiento.mcs_medicos.model.Medico;
import com.agendamiento.mcs_medicos.repository.MedicoRepository;

import java.util.List;

@RestController
@RequestMapping("/api/medicos")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class MedicoController {

    private final MedicoRepository repo;

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
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Médico no existe"));
    }

    @PutMapping("/{id}")
    public Medico actualizar(@PathVariable Long id, @RequestBody Medico m) {
        Medico db = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Médico no existe"));
        db.setNombre(m.getNombre());
        db.setEspecialidad(m.getEspecialidad());
        db.setActivo(m.isActivo());
        return repo.save(db);
    }

    @PatchMapping("/{id}/estado")
    public Medico cambiarEstado(@PathVariable Long id, @RequestParam boolean activo) {
        Medico db = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Médico no existe"));
        db.setActivo(activo);
        return repo.save(db);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        if (!repo.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Médico no existe");
        repo.deleteById(id);
    }

    @GetMapping("/{id}/disponible")
    public Boolean disponible(
            @PathVariable Long id,
            @RequestParam
            @org.springframework.format.annotation.DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm[:ss]") java.time.LocalDateTime fechaHora) {
        var m = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Médico no existe"));
        return m.isActivo(); // MVP
    }
}
