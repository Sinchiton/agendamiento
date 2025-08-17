// src/main/java/com/agendamiento/mcs_agendamiento/repository/TurnoRepository.java
package com.agendamiento.mcs_agendamiento.repository;
import com.agendamiento.mcs_agendamiento.model.Turno; import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime; import java.util.Optional;
public interface TurnoRepository extends JpaRepository<Turno,Long>{
  Optional<Turno> findByMedicoIdAndFechaHora(Long medicoId, LocalDateTime fechaHora);
}
