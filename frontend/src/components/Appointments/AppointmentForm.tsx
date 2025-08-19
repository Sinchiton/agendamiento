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
  })

  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestedTimes, setSuggestedTimes] = useState<string[]>([])

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (uiFormData.appointmentDate) {
      generateTimeSlots()
    }
  }, [uiFormData.appointmentDate])

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

  const generateTimeSlots = () => {
    const slots: string[] = []
    for (let hour = 8; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        slots.push(timeString)
      }
    }
    setAvailableSlots(slots)
  }

  const generateSuggestedTimes = (currentTime: string) => {
    const currentHour = Number.parseInt(currentTime.split(":")[0])
    const currentMinute = Number.parseInt(currentTime.split(":")[1])
    const suggestions: string[] = []

    for (let i = 1; i <= 3; i++) {
      const newMinutes = currentMinute + i * 30
      const newHour = currentHour + Math.floor(newMinutes / 60)
      const finalMinute = newMinutes % 60

      if (newHour < 17) {
        const timeString = `${newHour.toString().padStart(2, "0")}:${finalMinute.toString().padStart(2, "0")}`
        suggestions.push(timeString)
      }
    }

    return suggestions
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
    }

    if (name === "appointmentTime") {
      setSuggestedTimes([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError(null)
      setSuggestedTimes([])

      await AppointmentService.createAppointment(formData)
      onSuccess()
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Error al crear la cita"

      if (errorMessage.includes("Médico no disponible") || errorMessage.includes("no disponible")) {
        const suggestions = generateSuggestedTimes(uiFormData.appointmentTime)
        setSuggestedTimes(suggestions)
        setError(`El médico no está disponible en este horario. Te sugerimos los siguientes horarios alternativos:`)
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestedTimeClick = (suggestedTime: string) => {
    setUiFormData((prev) => ({
      ...prev,
      appointmentTime: suggestedTime,
    }))

    if (uiFormData.appointmentDate) {
      const fechaHora = `${uiFormData.appointmentDate}T${suggestedTime}:00`
      setFormData((prev) => ({
        ...prev,
        fechaHora,
      }))
    }

    setSuggestedTimes([])
    setError(null)
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

      {suggestedTimes.length > 0 && (
        <div className="card" style={{ backgroundColor: "#f8f9fa", border: "1px solid #dee2e6", marginBottom: "1rem" }}>
          <div className="card-header">
            <h4 style={{ margin: 0, color: "#495057" }}>Horarios Alternativos Sugeridos:</h4>
          </div>
          <div style={{ padding: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {suggestedTimes.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => handleSuggestedTimeClick(time)}
                className="btn btn-outline-primary"
                style={{ fontSize: "0.9rem", padding: "0.5rem 1rem" }}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}

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
                Horario * (8:00 AM - 5:00 PM)
              </label>
              <select
                id="appointmentTime"
                name="appointmentTime"
                value={uiFormData.appointmentTime}
                onChange={handleInputChange}
                className="form-select"
                required
                disabled={!uiFormData.appointmentDate}
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
