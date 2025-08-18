// BACKEND/mcs_medicos/src/main/java/com/agendamiento/mcs_medicos/service/DisponibilidadMedicoService.java
package com.agendamiento.mcs_medicos.service;

import com.agendamiento.mcs_medicos.model.HorarioMedico;
import com.agendamiento.mcs_medicos.model.Medico;
import com.agendamiento.mcs_medicos.repository.HorarioMedicoRepository;
import com.agendamiento.mcs_medicos.repository.MedicoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.*;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DisponibilidadMedicoService {

    private final MedicoRepository medicos;
    private final HorarioMedicoRepository horarios;

    public record Disponibilidad(boolean disponible, LocalDateTime sugerido) {

    }

    public Disponibilidad disponibilidad(Long medicoId, LocalDateTime fechaHora, int slotMin) {
        Medico m = medicos.findById(medicoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Médico no existe"));
        if (!m.isActivo()) {
            return new Disponibilidad(false, sugerir(medicoId, fechaHora, slotMin));
        }

        boolean dentro = dentroDeHorario(medicoId, fechaHora, slotMin);
        if (dentro) {
            return new Disponibilidad(true, null);
        }

        return new Disponibilidad(false, sugerir(medicoId, fechaHora, slotMin));
    }

    private boolean dentroDeHorario(Long medicoId, LocalDateTime fh, int slotMin) {
        DayOfWeek d = fh.getDayOfWeek();
        List<HorarioMedico> hs = horarios.findByMedicoIdAndDiaOrderByHoraInicioAsc(medicoId, d);
        LocalTime ini = fh.toLocalTime();
        LocalTime fin = ini.plusMinutes(slotMin);
        return hs.stream().anyMatch(h
                -> !ini.isBefore(h.getHoraInicio()) && !fin.isAfter(h.getHoraFin()));
    }

    /**
     * Siguiente inicio posible >= fh respetando horarios; busca hasta 30 días.
     */
    private LocalDateTime sugerir(Long medicoId, LocalDateTime fh, int slotMin) {
        for (int off = 0; off < 30; off++) {
            LocalDate date = fh.toLocalDate().plusDays(off);
            DayOfWeek dia = date.getDayOfWeek();
            List<HorarioMedico> hs = horarios.findByMedicoIdAndDiaOrderByHoraInicioAsc(medicoId, dia);
            LocalTime base = off == 0 ? fh.toLocalTime() : LocalTime.MIN;

            for (HorarioMedico h : hs) {
                LocalTime cand = roundUp(max(base, h.getHoraInicio()), slotMin);
                if (!cand.plusMinutes(slotMin).isAfter(h.getHoraFin())) {
                    return LocalDateTime.of(date, cand);
                }
            }
        }
        return null; // no hay sugerencia razonable
    }

    private static LocalTime max(LocalTime a, LocalTime b) {
        return a.isAfter(b) ? a : b;
    }

    private static LocalTime roundUp(LocalTime t, int step) {
        int m = t.getHour() * 60 + t.getMinute();
        int r = ((m + step - 1) / step) * step;
        int hh = r / 60, mm = r % 60;
        return (hh >= 24) ? LocalTime.of(23, 59, 59) : LocalTime.of(hh, mm);
    }
}
