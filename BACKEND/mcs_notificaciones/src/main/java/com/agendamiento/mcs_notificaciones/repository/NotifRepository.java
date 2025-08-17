package com.agendamiento.mcs_notificaciones.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.agendamiento.mcs_notificaciones.model.Notificacion;

public interface NotifRepository extends JpaRepository<Notificacion, Long> {
}
