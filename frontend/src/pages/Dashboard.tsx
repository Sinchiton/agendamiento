"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { AppointmentService } from "../services/appointmentService"
import type { Appointment } from "../types/appointment"
import LoadingSpinner from "../components/Common/LoadingSpinner"

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    total: 0,
    confirmado: 0,
    cancelado: 0,
    extra: 0,
  })
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      const today = new Date()
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString()

      const allAppointmentsResponse = await AppointmentService.getAppointments({ size: 1000 })
      const todayAppointmentsResponse = await AppointmentService.getAppointments({
        desde: todayStart,
        hasta: todayEnd,
        size: 100,
      })

      const allAppointments = allAppointmentsResponse.content
      const todayAppts = todayAppointmentsResponse.content

      const statsData = {
        total: allAppointmentsResponse.totalElements,
        confirmado: allAppointments.filter((a) => a.estado === "CONFIRMADO").length,
        cancelado: allAppointments.filter((a) => a.estado === "CANCELADO").length,
        extra: allAppointments.filter((a) => a.estado === "EXTRA").length,
      }

      setStats(statsData)
      setTodayAppointments(todayAppts)
    } catch (err) {
      console.error("Error loading dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (fechaHora: string) => {
    return new Date(fechaHora).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Dashboard - Resumen del Sistema</h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              padding: "1.5rem",
              backgroundColor: "#e3f2fd",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <h3 style={{ margin: "0 0 0.5rem 0", color: "#1976d2" }}>Total de Citas</h3>
            <p style={{ fontSize: "2rem", fontWeight: "bold", margin: 0, color: "#1976d2" }}>{stats.total}</p>
          </div>

          <div
            style={{
              padding: "1.5rem",
              backgroundColor: "#e8f5e8",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <h3 style={{ margin: "0 0 0.5rem 0", color: "#2e7d32" }}>Confirmadas</h3>
            <p style={{ fontSize: "2rem", fontWeight: "bold", margin: 0, color: "#2e7d32" }}>{stats.confirmado}</p>
          </div>

          <div
            style={{
              padding: "1.5rem",
              backgroundColor: "#fff3e0",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <h3 style={{ margin: "0 0 0.5rem 0", color: "#f57c00" }}>Extra</h3>
            <p style={{ fontSize: "2rem", fontWeight: "bold", margin: 0, color: "#f57c00" }}>{stats.extra}</p>
          </div>

          <div
            style={{
              padding: "1.5rem",
              backgroundColor: "#ffebee",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <h3 style={{ margin: "0 0 0.5rem 0", color: "#c62828" }}>Canceladas</h3>
            <p style={{ fontSize: "2rem", fontWeight: "bold", margin: 0, color: "#c62828" }}>{stats.cancelado}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Citas de Hoy</h2>
        </div>

        {todayAppointments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <p>No hay citas programadas para hoy</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Paciente</th>
                  <th>Doctor</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {todayAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{formatTime(appointment.fechaHora)}</td>
                    <td>Paciente ID: {appointment.pacienteId}</td>
                    <td>Médico ID: {appointment.medicoId}</td>
                    <td>
                      <span className={`status-badge status-${appointment.estado.toLowerCase()}`}>
                        {appointment.estado === "CONFIRMADO" && "Confirmado"}
                        {appointment.estado === "CANCELADO" && "Cancelado"}
                        {appointment.estado === "EXTRA" && "Extra"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
