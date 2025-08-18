"use client"

import type React from "react"
import { useState } from "react"
import { type Appointment, AppointmentStatus } from "../../types/appointment"
import Modal from "../Common/Modal"

interface AppointmentActionsProps {
  appointment: Appointment
  onEdit: (appointment: Appointment) => void
  onCancel: (appointmentId: string, reason?: string) => void
}

const AppointmentActions: React.FC<AppointmentActionsProps> = ({ appointment, onEdit, onCancel }) => {
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState("")

  const canEdit =
    appointment.status === AppointmentStatus.SCHEDULED || appointment.status === AppointmentStatus.CONFIRMED

  const canCancel =
    appointment.status === AppointmentStatus.SCHEDULED || appointment.status === AppointmentStatus.CONFIRMED

  const handleCancelConfirm = () => {
    onCancel(appointment.id, cancelReason)
    setShowCancelModal(false)
    setCancelReason("")
  }

  return (
    <>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {canEdit && (
          <button
            onClick={() => onEdit(appointment)}
            className="btn btn-primary"
            style={{ fontSize: "0.875rem", padding: "0.25rem 0.5rem" }}
          >
            Modificar
          </button>
        )}

        {canCancel && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="btn btn-danger"
            style={{ fontSize: "0.875rem", padding: "0.25rem 0.5rem" }}
          >
            Cancelar
          </button>
        )}

        {!canEdit && !canCancel && <span style={{ fontSize: "0.875rem", color: "#666" }}>Sin acciones</span>}
      </div>

      <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} title="Cancelar Cita">
        <p style={{ marginBottom: "1rem" }}>¿Está seguro que desea cancelar esta cita?</p>

        <div className="form-group">
          <label className="form-label">Motivo de cancelación (opcional)</label>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="form-textarea"
            placeholder="Ingrese el motivo de la cancelación"
            rows={3}
          />
        </div>

        <div className="btn-group">
          <button onClick={handleCancelConfirm} className="btn btn-danger">
            Confirmar Cancelación
          </button>
          <button onClick={() => setShowCancelModal(false)} className="btn btn-secondary">
            Cancelar
          </button>
        </div>
      </Modal>
    </>
  )
}

export default AppointmentActions
