package com.agendamiento.mcs_pacientes.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.agendamiento.mcs_pacientes.model.Paciente;

public interface PacienteRepository extends JpaRepository<Paciente, Long> {
}
