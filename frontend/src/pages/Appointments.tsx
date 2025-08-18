"use client"

import type React from "react"
import { useState } from "react"
import type { Appointment } from "../types/appointment"
import AppointmentList from "../components/Appointments/AppointmentList"
import EditAppointmentForm from "../components/Appointments/EditAppointmentForm"
import Modal from "../components/Common/Modal"
import Alert from "../components/Common/Alert"

const Appointments: React.FC = () => {
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment)
  }

  const handleEditSuccess = () => {
    setEditingAppointment(null)
    setSuccessMessage("Cita actualizada exitosamente")
    setRefreshTrigger((prev) => prev + 1)

    setTimeout(() => {
      setSuccessMessage(null)
    }, 3000)
  }

  const handleEditCancel = () => {
    setEditingAppointment(null)
  }

  return (
    <div>
      {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />}

      <AppointmentList onEdit={handleEdit} refreshTrigger={refreshTrigger} />

      <Modal isOpen={!!editingAppointment} onClose={handleEditCancel} title="Modificar Cita">
        {editingAppointment && (
          <EditAppointmentForm
            appointment={editingAppointment}
            onSuccess={handleEditSuccess}
            onCancel={handleEditCancel}
          />
        )}
      </Modal>
    </div>
  )
}

export default Appointments
