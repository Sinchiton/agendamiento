"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { AppointmentFilters, Doctor, Patient } from "../../types/appointment"
import { DoctorService } from "../../services/doctorService"
import { PatientService } from "../../services/patientService"

interface AppointmentFiltersProps {
  filters: AppointmentFilters
  onFiltersChange: (filters: AppointmentFilters) => void
}

const AppointmentFiltersComponent: React.FC<AppointmentFiltersProps> = ({ filters, onFiltersChange }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadFilterData()
  }, [])

  const loadFilterData = async () => {
    try {
      const [doctorsData, patientsData] = await Promise.all([
        DoctorService.getAllDoctors(),
        PatientService.getAllPatients(),
      ])
      setDoctors(doctorsData)
      setPatients(patientsData)
    } catch (err) {
      console.error("Error loading filter data:", err)
    }
  }

  const handleFilterChange = (key: keyof AppointmentFilters, value: string) => {
    const newFilters = {
      ...filters,
      [key]: value || undefined,
    }
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const hasActiveFilters = Object.values(filters).some((value) => value !== undefined && value !== "")

  return (
    <div className="filters">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 className="filters-title">Filtros de búsqueda</h3>
        <div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary"
            style={{ marginRight: "0.5rem" }}
          >
            {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
          </button>
          {hasActiveFilters && (
            <button type="button" onClick={clearFilters} className="btn btn-warning">
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <div>
          <div className="form-row">
            <div className="form-col">
              <div className="form-group">
                <label className="form-label">Paciente</label>
                <select
                  value={filters.pacienteId || ""}
                  onChange={(e) => handleFilterChange("pacienteId", e.target.value)}
                  className="form-select"
                >
                  <option value="">Todos los pacientes</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-col">
              <div className="form-group">
                <label className="form-label">Doctor</label>
                <select
                  value={filters.medicoId || ""}
                  onChange={(e) => handleFilterChange("medicoId", e.target.value)}
                  className="form-select"
                >
                  <option value="">Todos los doctores</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-col">
              <div className="form-group">
                <label className="form-label">Estado</label>
                <select
                  value={filters.estado || ""}
                  onChange={(e) => handleFilterChange("estado", e.target.value)}
                  className="form-select"
                >
                  <option value="">Todos los estados</option>
                  <option value="CONFIRMADO">Confirmado</option>
                  <option value="CANCELADO">Cancelado</option>
                  <option value="EXTRA">Extra</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-col">
              <div className="form-group">
                <label className="form-label">Fecha desde</label>
                <input
                  type="datetime-local"
                  value={filters.desde || ""}
                  onChange={(e) => handleFilterChange("desde", e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-col">
              <div className="form-group">
                <label className="form-label">Fecha hasta</label>
                <input
                  type="datetime-local"
                  value={filters.hasta || ""}
                  onChange={(e) => handleFilterChange("hasta", e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AppointmentFiltersComponent
