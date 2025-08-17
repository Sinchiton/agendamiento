package com.agendamiento.mcs_medicos.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.agendamiento.mcs_medicos.model.Medico;

public interface MedicoRepository extends JpaRepository<Medico, Long> {
}
