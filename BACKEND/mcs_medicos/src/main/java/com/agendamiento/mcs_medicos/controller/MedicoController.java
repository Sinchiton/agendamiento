package com.agendamiento.mcs_medicos.controller;

import java.time.LocalDateTime;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.agendamiento.mcs_medicos.model.Medico;
import com.agendamiento.mcs_medicos.repository.MedicoRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/medicos")
@RequiredArgsConstructor
public class MedicoController {

    private final MedicoRepository repo;

    @PostMapping
    public Medico crear(@RequestBody Medico m) {
        return repo.save(m);
    }

    @GetMapping("/{id}")
    public Medico get(@PathVariable Long id) {
        return repo.findById(id).orElseThrow();
    }

    @GetMapping("/{id}/disponible")
    public boolean disponible(@PathVariable Long id, @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaHora) {
        return repo.findById(id).map(Medico::isActivo).orElse(false);
    }
}
