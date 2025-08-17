package com.agendamiento.mcs_pacientes.controller;

import com.agendamiento.mcs_pacientes.model.Paciente;
import com.agendamiento.mcs_pacientes.repository.PacienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pacientes")
@RequiredArgsConstructor
public class PacienteController {

    private final PacienteRepository repo;

    @PostMapping
    public Paciente crear(@RequestBody Paciente p) {
        return repo.save(p);
    }

    @GetMapping("/{id}")
    public Paciente get(@PathVariable Long id) {
        return repo.findById(id).orElseThrow();
    }
}
