"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { CreateAppointmentRequest, Doctor, Patient } from "../../types/appointment"
import { getAllDoctors } from "../../services/doctorService"
import { getAllPatients } from "../../services/patientService"
import { AppointmentService } from "../../services/appointmentService"
import LoadingSpinner from "../Common/LoadingSpinner"
import Alert from "../Common/Alert"

interface AppointmentFormProps {
  onSuccess: () => void
  onCancel: () => void
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<CreateAppointmentRequest>({
    pacienteId: 0,
    medicoId: 0,
    fechaHora: "",
  })

  const [uiFormData, setUiFormData] = useState({
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
    notes: "",
  })

  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (formData.medicoId && uiFormData.appointmentDate) {
      loadAvailableSlots()
    }
  }, [formData.medicoId, uiFormData.appointmentDate])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [doctorsData, patientsData] = await Promise.all([getAllDoctors(), getAllPatients()])
      setDoctors(doctorsData)
      setPatients(patientsData)
    } catch (err) {
      setError("Error al cargar los datos iniciales")
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableSlots = async () => {
    try {
      setLoadingSlots(true)
      const slots = await AppointmentService.getAvailableSlots(formData.medicoId.toString(), uiFormData.appointmentDate)
      setAvailableSlots(slots)
    } catch (err) {
      setError("Error al cargar los horarios disponibles")
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === "pacienteId" || name === "medicoId") {
      setFormData((prev) => ({
        ...prev,
        [name]: Number.parseInt(value) || 0,
      }))
    } else if (name === "appointmentDate" || name === "appointmentTime") {
      setUiFormData((prev) => ({
        ...prev,
        [name]: value,
      }))

      if (name === "appointmentDate" || name === "appointmentTime") {
        const date = name === "appointmentDate" ? value : uiFormData.appointmentDate
        const time = name === "appointmentTime" ? value : uiFormData.appointmentTime

        if (date && time) {
          const fechaHora = `${date}T${time}:00`
          setFormData((prev) => ({
            ...prev,
            fechaHora,
          }))
        }
      }
    } else {
      setUiFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }

    if (name === "medicoId" || name === "appointmentDate") {
      setUiFormData((prev) => ({
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

      await AppointmentService.createAppointment(formData)
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al crear la cita")
    } finally {
      setLoading(false)
    }
  }

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split("T")[0]
  }

  if (loading && doctors.length === 0) {
    return <LoadingSpinner />
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Agendar Nueva Cita</h2>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-col">
            <div className="form-group">
              <label htmlFor="pacienteId" className="form-label">
                Paciente *
              </label>
              <select
                id="pacienteId"
                name="pacienteId"
                value={formData.pacienteId}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Seleccionar paciente</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.nombre} - {patient.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-col">
            <div className="form-group">
              <label htmlFor="medicoId" className="form-label">
                Doctor *
              </label>
              <select
                id="medicoId"
                name="medicoId"
                value={formData.medicoId}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Seleccionar doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr. {doctor.nombre} - {doctor.especialidad}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-col">
            <div className="form-group">
              <label htmlFor="appointmentDate" className="form-label">
                Fecha *
              </label>
              <input
                type="date"
                id="appointmentDate"
                name="appointmentDate"
                value={uiFormData.appointmentDate}
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
                Horario * {loadingSlots && "(Cargando...)"}
              </label>
              <select
                id="appointmentTime"
                name="appointmentTime"
                value={uiFormData.appointmentTime}
                onChange={handleInputChange}
                className="form-select"
                required
                disabled={!formData.medicoId || !uiFormData.appointmentDate || loadingSlots}
              >
                <option value="">Seleccionar horario</option>
                {availableSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="reason" className="form-label">
            Motivo de la consulta *
          </label>
          <input
            type="text"
            id="reason"
            name="reason"
            value={uiFormData.reason}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Ej: Consulta general, control, etc."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes" className="form-label">
            Notas adicionales
          </label>
          <textarea
            id="notes"
            name="notes"
            value={uiFormData.notes}
            onChange={handleInputChange}
            className="form-textarea"
            placeholder="Información adicional relevante para la cita"
            rows={3}
          />
        </div>

        <div className="btn-group">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Agendando..." : "Agendar Cita"}
          </button>
          <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={loading}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

export default AppointmentForm
