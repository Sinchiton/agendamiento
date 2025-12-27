// BACKEND/mcs_medicos/src/main/java/com/agendamiento/mcs_medicos/repository/HorarioMedicoRepository.java
package com.agendamiento.mcs_medicos.repository;

import com.agendamiento.mcs_medicos.model.HorarioMedico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.util.List;

public interface HorarioMedicoRepository extends JpaRepository<HorarioMedico, Long> {

    // 👉 usado por GET /api/medicos/{id}/horarios
    List<HorarioMedico> findByMedicoId(Long medicoId);

    // útil si quieres consultar por día ordenado
    List<HorarioMedico> findByMedicoIdAndDiaOrderByHoraInicioAsc(Long medicoId, DayOfWeek dia);

    // 👉 bulk delete: debe ser modificatorio y transaccional
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    int deleteByMedicoId(Long medicoId);
}
