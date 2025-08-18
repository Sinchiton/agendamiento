// BACKEND/mcs_medicos/src/main/java/com/agendamiento/mcs_medicos/repository/HorarioMedicoRepository.java
package com.agendamiento.mcs_medicos.repository;

import com.agendamiento.mcs_medicos.model.HorarioMedico;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;
import java.util.List;

public interface HorarioMedicoRepository extends JpaRepository<HorarioMedico, Long> {

    List<HorarioMedico> findByMedicoIdAndDiaOrderByHoraInicioAsc(Long medicoId, DayOfWeek dia);

    void deleteByMedicoId(Long medicoId);
}
