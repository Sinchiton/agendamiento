"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { getDoctorSchedules, updateDoctorSchedules, getAllDoctors } from "../services/doctorService"
import type { Doctor, DoctorSchedule, DayOfWeek } from "../types/appointment"

const DoctorSchedules: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null)
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const daysOfWeek: { value: DayOfWeek; label: string }[] = [
    { value: "MONDAY" as DayOfWeek, label: "Lunes" },
    { value: "TUESDAY" as DayOfWeek, label: "Martes" },
    { value: "WEDNESDAY" as DayOfWeek, label: "Miércoles" },
    { value: "THURSDAY" as DayOfWeek, label: "Jueves" },
    { value: "FRIDAY" as DayOfWeek, label: "Viernes" },
    { value: "SATURDAY" as DayOfWeek, label: "Sábado" },
    { value: "SUNDAY" as DayOfWeek, label: "Domingo" },
  ]

  useEffect(() => {
    loadDoctors()
  }, [])

  useEffect(() => {
    if (selectedDoctorId) {
      loadSchedules()
    }
  }, [selectedDoctorId])

  const loadDoctors = async () => {
    try {
      const doctorsData = await getAllDoctors()
      setDoctors(doctorsData.filter((d) => d.activo))
    } catch (err) {
      setError("Error al cargar médicos")
    }
  }

  const loadSchedules = async () => {
    if (!selectedDoctorId) return

    setLoading(true)
    try {
      const schedulesData = await getDoctorSchedules(selectedDoctorId)
      setSchedules(schedulesData)
    } catch (err) {
      setSchedules([])
    } finally {
      setLoading(false)
    }
  }

  const addScheduleSlot = () => {
    setSchedules([...schedules, { dia: "MONDAY" as DayOfWeek, inicio: "09:00", fin: "17:00" }])
  }

  const removeScheduleSlot = (index: number) => {
    setSchedules(schedules.filter((_, i) => i !== index))
  }

  const updateScheduleSlot = (index: number, field: keyof DoctorSchedule, value: string) => {
    const updated = schedules.map((schedule, i) => (i === index ? { ...schedule, [field]: value } : schedule))
    setSchedules(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDoctorId) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await updateDoctorSchedules(selectedDoctorId, schedules)
      setSuccess("Horarios actualizados correctamente")
    } catch (err) {
      setError("Error al actualizar horarios")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="doctor-schedules">
      <h1>Gestión de Horarios de Médicos</h1>

      <div className="form-group">
        <label htmlFor="doctor-select">Seleccionar Médico:</label>
        <select
          id="doctor-select"
          value={selectedDoctorId || ""}
          onChange={(e) => setSelectedDoctorId(Number(e.target.value) || null)}
          className="form-control"
        >
          <option value="">Seleccione un médico</option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.nombre} - {doctor.especialidad}
            </option>
          ))}
        </select>
      </div>

      {selectedDoctorId && (
        <form onSubmit={handleSubmit} className="schedule-form">
          <div className="schedule-slots">
            <h3>Horarios de Atención</h3>

            {schedules.map((schedule, index) => (
              <div key={index} className="schedule-slot">
                <select
                  value={schedule.dia}
                  onChange={(e) => updateScheduleSlot(index, "dia", e.target.value)}
                  className="form-control"
                >
                  {daysOfWeek.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>

                <input
                  type="time"
                  value={schedule.inicio}
                  onChange={(e) => updateScheduleSlot(index, "inicio", e.target.value)}
                  className="form-control"
                />

                <input
                  type="time"
                  value={schedule.fin}
                  onChange={(e) => updateScheduleSlot(index, "fin", e.target.value)}
                  className="form-control"
                />

                <button type="button" onClick={() => removeScheduleSlot(index)} className="btn btn-danger">
                  Eliminar
                </button>
              </div>
            ))}

            <button type="button" onClick={addScheduleSlot} className="btn btn-secondary">
              Agregar Horario
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? "Guardando..." : "Guardar Horarios"}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default DoctorSchedules
