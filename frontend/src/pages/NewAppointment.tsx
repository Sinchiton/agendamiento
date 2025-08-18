"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import AppointmentForm from "../components/Appointments/AppointmentForm"
import Alert from "../components/Common/Alert"

const NewAppointment: React.FC = () => {
  const navigate = useNavigate()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSuccess = () => {
    setSuccessMessage("Cita agendada exitosamente")
    setTimeout(() => {
      navigate("/appointments")
    }, 2000)
  }

  const handleCancel = () => {
    navigate("/")
  }

  return (
    <div>
      {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />}

      <AppointmentForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  )
}

export default NewAppointment
