"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { type Appointment, AppointmentStatus, type AppointmentFilters } from "../../types/appointment"
import { AppointmentService } from "../../services/appointmentService"
import LoadingSpinner from "../Common/LoadingSpinner"
import Alert from "../Common/Alert"
import AppointmentFiltersComponent from "./AppointmentFilters"
import AppointmentActions from "./AppointmentActions"

interface AppointmentListProps {
  onEdit: (appointment: Appointment) => void
  refreshTrigger?: number
}

const AppointmentList: React.FC<AppointmentListProps> = ({ onEdit, refreshTrigger }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<AppointmentFilters>({})

  useEffect(() => {
    loadAppointments()
  }, [filters, refreshTrigger])

  const loadAppointments = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await AppointmentService.getAppointments(filters)
      setAppointments(data)
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar las citas")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (appointmentId: string, reason?: string) => {
    try {
      await AppointmentService.cancelAppointment(appointmentId, reason)
      await loadAppointments() // Refresh the list
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cancelar la cita")
    }
  }

  const getStatusBadge = (status: AppointmentStatus) => {
    const statusClasses = {
      [AppointmentStatus.SCHEDULED]: "status-badge status-scheduled",
      [AppointmentStatus.CONFIRMED]: "status-badge status-confirmed",
      [AppointmentStatus.CANCELLED]: "status-badge status-cancelled",
      [AppointmentStatus.COMPLETED]: "status-badge status-completed",
      [AppointmentStatus.NO_SHOW]: "status-badge status-no-show",
    }

    const statusLabels = {
      [AppointmentStatus.SCHEDULED]: "Programada",
      [AppointmentStatus.CONFIRMED]: "Confirmada",
      [AppointmentStatus.CANCELLED]: "Cancelada",
      [AppointmentStatus.COMPLETED]: "Completada",
      [AppointmentStatus.NO_SHOW]: "No Asistió",
    }

    return <span className={statusClasses[status]}>{statusLabels[status]}</span>
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: es })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Consulta de Citas</h2>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <AppointmentFiltersComponent filters={filters} onFiltersChange={setFilters} />

      {appointments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <p>No se encontraron citas con los filtros aplicados</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Paciente</th>
                <th>Doctor</th>
                <th>Motivo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{formatDate(appointment.appointmentDate)}</td>
                  <td>{appointment.appointmentTime}</td>
                  <td>
                    {appointment.patient ? `${appointment.patient.firstName} ${appointment.patient.lastName}` : "N/A"}
                  </td>
                  <td>
                    {appointment.doctor ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}` : "N/A"}
                  </td>
                  <td>{appointment.reason}</td>
                  <td>{getStatusBadge(appointment.status)}</td>
                  <td>
                    <AppointmentActions appointment={appointment} onEdit={onEdit} onCancel={handleCancel} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AppointmentList
