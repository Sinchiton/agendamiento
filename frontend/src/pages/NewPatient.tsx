"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createPatient } from "../services/patientService"
import type { CreatePatientRequest } from "../types/appointment"
import Alert from "../components/Common/Alert"
import LoadingSpinner from "../components/Common/LoadingSpinner"

const NewPatient: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState<CreatePatientRequest>({
    nombre: "",
    email: "",
    edad: 0,
    telefono: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number.parseInt(value) || 0 : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await createPatient(formData)
      setSuccess(true)
      setTimeout(() => {
        navigate("/")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el paciente")
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
          <h1>Agregar Nuevo Paciente</h1>
          <p>Complete los datos del paciente</p>
        </div>

        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message="Paciente creado exitosamente" />}

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
                placeholder="Ej: Ana Torres"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="ana.torres@mail.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefono">Teléfono</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Ej: +593 99 123 4567"
              />
            </div>

            <div className="form-group">
              <label htmlFor="edad">Edad *</label>
              <input
                type="number"
                id="edad"
                name="edad"
                value={formData.edad}
                onChange={handleInputChange}
                required
                min="1"
                max="120"
                className="form-input"
                placeholder="32"
              />
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => navigate("/")} className="btn btn-secondary">
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? "Creando..." : "Crear Paciente"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default NewPatient
