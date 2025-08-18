package com.agendamiento.mcs_pacientes.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import com.agendamiento.mcs_pacientes.model.Paciente;
import com.agendamiento.mcs_pacientes.repository.PacienteRepository;

import java.util.List;

@RestController
@RequestMapping("/api/pacientes")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PacienteController {

    private final PacienteRepository repo;

    @GetMapping({"", "/"})
    public List<Paciente> listar() {
        return repo.findAll();
    }

    @PostMapping({"", "/"})
    @ResponseStatus(HttpStatus.CREATED)
    public Paciente crear(@RequestBody Paciente p) {
        return repo.save(p);
    }

    @GetMapping("/{id}")
    public Paciente get(@PathVariable Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Paciente no existe"));
    }

    @PutMapping("/{id}")
    public Paciente actualizar(@PathVariable Long id, @RequestBody Paciente p) {
        Paciente db = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Paciente no existe"));
        db.setNombre(p.getNombre());
        db.setEmail(p.getEmail());
        // setea otros campos que tengas
        return repo.save(db);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        if (!repo.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Paciente no existe");
        repo.deleteById(id);
    }
}
