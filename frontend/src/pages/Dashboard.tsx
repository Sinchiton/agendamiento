"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { AppointmentService } from "../services/appointmentService"
import { type Appointment, AppointmentStatus } from "../types/appointment"
import LoadingSpinner from "../components/Common/LoadingSpinner"

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  })
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      const today = new Date().toISOString().split("T")[0]

      // Load all appointments for stats
      const allAppointments = await AppointmentService.getAppointments()

      // Load today's appointments
      const todayAppts = await AppointmentService.getAppointments({
        dateFrom: today,
        dateTo: today,
      })

      // Calculate stats
      const statsData = {
        total: allAppointments.length,
        scheduled: allAppointments.filter((a) => a.status === AppointmentStatus.SCHEDULED).length,
        confirmed: allAppointments.filter((a) => a.status === AppointmentStatus.CONFIRMED).length,
        completed: allAppointments.filter((a) => a.status === AppointmentStatus.COMPLETED).length,
        cancelled: allAppointments.filter((a) => a.status === AppointmentStatus.CANCELLED).length,
      }

      setStats(statsData)
      setTodayAppointments(todayAppts)
    } catch (err) {
      console.error("Error loading dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timeString: string) => {
    return timeString
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
              backgroundColor: "#fff3e0",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <h3 style={{ margin: "0 0 0.5rem 0", color: "#f57c00" }}>Programadas</h3>
            <p style={{ fontSize: "2rem", fontWeight: "bold", margin: 0, color: "#f57c00" }}>{stats.scheduled}</p>
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
            <p style={{ fontSize: "2rem", fontWeight: "bold", margin: 0, color: "#2e7d32" }}>{stats.confirmed}</p>
          </div>

          <div
            style={{
              padding: "1.5rem",
              backgroundColor: "#f3e5f5",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <h3 style={{ margin: "0 0 0.5rem 0", color: "#7b1fa2" }}>Completadas</h3>
            <p style={{ fontSize: "2rem", fontWeight: "bold", margin: 0, color: "#7b1fa2" }}>{stats.completed}</p>
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
            <p style={{ fontSize: "2rem", fontWeight: "bold", margin: 0, color: "#c62828" }}>{stats.cancelled}</p>
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
                  <th>Motivo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {todayAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{formatTime(appointment.appointmentTime)}</td>
                    <td>
                      {appointment.patient ? `${appointment.patient.firstName} ${appointment.patient.lastName}` : "N/A"}
                    </td>
                    <td>
                      {appointment.doctor
                        ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                        : "N/A"}
                    </td>
                    <td>{appointment.reason}</td>
                    <td>
                      <span className={`status-badge status-${appointment.status.toLowerCase()}`}>
                        {appointment.status === AppointmentStatus.SCHEDULED && "Programada"}
                        {appointment.status === AppointmentStatus.CONFIRMED && "Confirmada"}
                        {appointment.status === AppointmentStatus.CANCELLED && "Cancelada"}
                        {appointment.status === AppointmentStatus.COMPLETED && "Completada"}
                        {appointment.status === AppointmentStatus.NO_SHOW && "No Asistió"}
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
