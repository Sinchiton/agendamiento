"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createDoctor } from "../services/doctorService"
import type { CreateDoctorRequest } from "../types/appointment"
import Alert from "../components/Common/Alert"
import LoadingSpinner from "../components/Common/LoadingSpinner"

const NewDoctor: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState<CreateDoctorRequest>({
    nombre: "",
    especialidad: "",
    activo: true,
  })

  const especialidades = [
    "Cardiología",
    "Dermatología",
    "Endocrinología",
    "Gastroenterología",
    "Ginecología",
    "Medicina General",
    "Neurología",
    "Oftalmología",
    "Ortopedia",
    "Pediatría",
    "Psiquiatría",
    "Traumatología",
    "Urología",
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await createDoctor(formData)
      setSuccess(true)
      setTimeout(() => {
        navigate("/")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el médico")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>Agregar Nuevo Médico</h1>
          <p>Complete los datos del médico</p>
        </div>

        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message="Médico creado exitosamente" />}

        <div className="form-container">
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label htmlFor="nombre">Nombre Completo *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="Ej: Juan Pérez"
              />
            </div>

            <div className="form-group">
              <label htmlFor="especialidad">Especialidad *</label>
              <select
                id="especialidad"
                name="especialidad"
                value={formData.especialidad}
                onChange={handleInputChange}
                required
                className="form-input"
              >
                <option value="">Seleccione una especialidad</option>
                {especialidades.map((esp) => (
                  <option key={esp} value={esp}>
                    {esp}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="activo">
                <input
                  type="checkbox"
                  id="activo"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleInputChange}
                  className="form-checkbox"
                />
                Médico activo
              </label>
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => navigate("/")} className="btn btn-secondary">
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? "Creando..." : "Crear Médico"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default NewDoctor
