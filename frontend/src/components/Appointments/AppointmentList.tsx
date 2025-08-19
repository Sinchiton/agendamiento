"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { type Appointment, EstadoTurno, type AppointmentFilters, type Page } from "../../types/appointment"
import { AppointmentService } from "../../services/appointmentService"
import { PatientService } from "../../services/patientService"
import { DoctorService } from "../../services/doctorService"
import LoadingSpinner from "../Common/LoadingSpinner"
import Alert from "../Common/Alert"
import AppointmentFiltersComponent from "./AppointmentFilters"

interface AppointmentListProps {
  onEdit: (appointment: Appointment) => void
  refreshTrigger?: number
}

const AppointmentList: React.FC<AppointmentListProps> = ({ onEdit, refreshTrigger }) => {
  const [appointmentsPage, setAppointmentsPage] = useState<Page<Appointment> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<AppointmentFilters>({ size: 20, sort: "fechaHora,desc" })
  const [patients, setPatients] = useState<{ [key: number]: any }>({})
  const [doctors, setDoctors] = useState<{ [key: number]: any }>({})

  useEffect(() => {
    loadAppointments()
  }, [filters, refreshTrigger])

  const loadAppointments = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await AppointmentService.getAppointments(filters)
      setAppointmentsPage(data)

      await loadPatientAndDoctorData(data.content)
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar las citas")
    } finally {
      setLoading(false)
    }
  }

  const loadPatientAndDoctorData = async (appointments: Appointment[]) => {
    const patientIds = [...new Set(appointments.map((a) => a.pacienteId))]
    const doctorIds = [...new Set(appointments.map((a) => a.medicoId))]

    try {
      const patientPromises = patientIds.map(async (id) => {
        if (!patients[id]) {
          const patient = await PatientService.getPatientById(id)
          return { id, patient }
        }
        return null
      })

      const doctorPromises = doctorIds.map(async (id) => {
        if (!doctors[id]) {
          const doctor = await DoctorService.getDoctorById(id)
          return { id, doctor }
        }
        return null
      })

      const patientResults = await Promise.all(patientPromises)
      const doctorResults = await Promise.all(doctorPromises)

      const newPatients = { ...patients }
      const newDoctors = { ...doctors }

      patientResults.forEach((result) => {
        if (result) newPatients[result.id] = result.patient
      })

      doctorResults.forEach((result) => {
        if (result) newDoctors[result.id] = result.doctor
      })

      setPatients(newPatients)
      setDoctors(newDoctors)
    } catch (error) {
      console.error("Error loading patient/doctor data:", error)
    }
  }

  const handleConfirm = async (appointmentId: number) => {
    try {
      await AppointmentService.confirmAppointment(appointmentId)
      await loadAppointments()
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al confirmar la cita")
    }
  }

  const handleCancel = async (appointmentId: number) => {
    try {
      await AppointmentService.cancelAppointment(appointmentId)
      await loadAppointments()
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cancelar la cita")
    }
  }

  const getStatusBadge = (estado: EstadoTurno) => {
    const statusClasses = {
      [EstadoTurno.CONFIRMADO]: "status-badge status-confirmed",
      [EstadoTurno.EXTRA]: "status-badge status-extra",
      [EstadoTurno.CANCELADO]: "status-badge status-cancelled",
      [EstadoTurno.COMPLETADO]: "status-badge status-completed",
      [EstadoTurno.NO_SHOW]: "status-badge status-no-show",
    }

    const statusLabels = {
      [EstadoTurno.CONFIRMADO]: "Confirmado",
      [EstadoTurno.EXTRA]: "Extra",
      [EstadoTurno.CANCELADO]: "Cancelado",
      [EstadoTurno.COMPLETADO]: "Completado",
      [EstadoTurno.NO_SHOW]: "No Asistió",
    }

    return <span className={statusClasses[estado] || "status-badge"}>{statusLabels[estado] || estado}</span>
  }

  const formatDateTime = (fechaHora: string) => {
    try {
      const date = new Date(fechaHora)
      return {
        date: format(date, "dd/MM/yyyy", { locale: es }),
        time: format(date, "HH:mm", { locale: es }),
      }
    } catch {
      return { date: fechaHora, time: "" }
    }
  }

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }))
  }

  if (loading) {
    return <LoadingSpinner />
  }

  const appointments = appointmentsPage?.content || []

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Lista de Turnos</h2>
        {appointmentsPage && (
          <p className="text-sm text-gray-600">
            Mostrando {appointmentsPage.numberOfElements} de {appointmentsPage.totalElements} turnos
          </p>
        )}
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <AppointmentFiltersComponent filters={filters} onFiltersChange={setFilters} />

      {appointments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <p>No se encontraron turnos con los filtros aplicados</p>
        </div>
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Paciente</th>
                  <th>Médico</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => {
                  const { date, time } = formatDateTime(appointment.fechaHora)
                  const patient = patients[appointment.pacienteId]
                  const doctor = doctors[appointment.medicoId]

                  return (
                    <tr key={appointment.id}>
                      <td>{appointment.id}</td>
                      <td>{date}</td>
                      <td>{time}</td>
                      <td>{patient?.nombre || `Paciente ${appointment.pacienteId}`}</td>
                      <td>{doctor?.nombre || `Médico ${appointment.medicoId}`}</td>
                      <td>{getStatusBadge(appointment.estado)}</td>
                      <td>
                        <div className="action-buttons">
                          {appointment.estado === EstadoTurno.CONFIRMADO && (
                            <button
                              onClick={() => handleCancel(appointment.id)}
                              className="btn btn-sm btn-danger"
                              title="Cancelar turno"
                            >
                              Cancelar
                            </button>
                          )}
                          {appointment.estado === EstadoTurno.CANCELADO && (
                            <button
                              onClick={() => handleConfirm(appointment.id)}
                              className="btn btn-sm btn-success"
                              title="Confirmar turno"
                            >
                              Confirmar
                            </button>
                          )}
                          {/**<button
                            onClick={() => onEdit(appointment)}
                            className="btn btn-sm btn-secondary"
                            title="Ver detalles"
                          >
                            Ver
                          </button>**/}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {appointmentsPage && appointmentsPage.totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(appointmentsPage.number - 1)}
                  disabled={appointmentsPage.first}
                  className="btn btn-sm"
                >
                  Anterior
                </button>

                <span className="pagination-info">
                  Página {appointmentsPage.number + 1} de {appointmentsPage.totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(appointmentsPage.number + 1)}
                  disabled={appointmentsPage.last}
                  className="btn btn-sm"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AppointmentList
