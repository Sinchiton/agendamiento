"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  type Appointment,
  type UpdateAppointmentRequest,
  type Doctor,
  AppointmentStatus,
} from "../../types/appointment"
import { AppointmentService } from "../../services/appointmentService"
import { DoctorService } from "../../services/doctorService"
import Alert from "../Common/Alert"

interface EditAppointmentFormProps {
  appointment: Appointment
  onSuccess: () => void
  onCancel: () => void
}

const EditAppointmentForm: React.FC<EditAppointmentFormProps> = ({ appointment, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<UpdateAppointmentRequest>({
    appointmentDate: appointment.appointmentDate,
    appointmentTime: appointment.appointmentTime,
    reason: appointment.reason,
    notes: appointment.notes || "",
    status: appointment.status,
  })

  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDoctors()
  }, [])

  useEffect(() => {
    if (appointment.doctorId && formData.appointmentDate) {
      loadAvailableSlots()
    }
  }, [formData.appointmentDate, appointment.doctorId])

  const loadDoctors = async () => {
    try {
      const doctorsData = await DoctorService.getDoctors()
      setDoctors(doctorsData)
    } catch (err) {
      setError("Error al cargar los doctores")
    }
  }

  const loadAvailableSlots = async () => {
    try {
      setLoadingSlots(true)
      const slots = await AppointmentService.getAvailableSlots(appointment.doctorId, formData.appointmentDate!)

      // Include current appointment time in available slots
      if (!slots.includes(appointment.appointmentTime)) {
        slots.push(appointment.appointmentTime)
        slots.sort()
      }

      setAvailableSlots(slots)
    } catch (err) {
      setError("Error al cargar los horarios disponibles")
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (name === "appointmentDate") {
      setFormData((prev) => ({
        ...prev,
        appointmentTime: "",
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError(null)

      await AppointmentService.updateAppointment(appointment.id, formData)
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al actualizar la cita")
    } finally {
      setLoading(false)
    }
  }

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split("T")[0]
  }

  const currentDoctor = doctors.find((d) => d.id === appointment.doctorId)

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Modificar Cita</h2>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
        <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem" }}>Información actual:</h3>
        <p>
          <strong>Paciente:</strong> {appointment.patient?.firstName} {appointment.patient?.lastName}
        </p>
        <p>
          <strong>Doctor:</strong> Dr. {currentDoctor?.firstName} {currentDoctor?.lastName} - {currentDoctor?.specialty}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-col">
            <div className="form-group">
              <label htmlFor="appointmentDate" className="form-label">
                Nueva Fecha
              </label>
              <input
                type="date"
                id="appointmentDate"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleInputChange}
                className="form-input"
                min={getTomorrowDate()}
                required
              />
            </div>
          </div>

          <div className="form-col">
            <div className="form-group">
              <label htmlFor="appointmentTime" className="form-label">
                Nuevo Horario {loadingSlots && "(Cargando...)"}
              </label>
              <select
                id="appointmentTime"
                name="appointmentTime"
                value={formData.appointmentTime}
                onChange={handleInputChange}
                className="form-select"
                required
                disabled={!formData.appointmentDate || loadingSlots}
              >
                <option value="">Seleccionar horario</option>
                {availableSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot} {slot === appointment.appointmentTime ? "(Actual)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="reason" className="form-label">
            Motivo de la consulta
          </label>
          <input
            type="text"
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="status" className="form-label">
            Estado
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="form-select"
            required
          >
            <option value={AppointmentStatus.SCHEDULED}>Programada</option>
            <option value={AppointmentStatus.CONFIRMED}>Confirmada</option>
            <option value={AppointmentStatus.COMPLETED}>Completada</option>
            <option value={AppointmentStatus.NO_SHOW}>No Asistió</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="notes" className="form-label">
            Notas adicionales
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            className="form-textarea"
            rows={3}
          />
        </div>

        <div className="btn-group">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Actualizando..." : "Actualizar Cita"}
          </button>
          <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={loading}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditAppointmentForm
