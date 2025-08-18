import { api } from "./api"
import type { Appointment, CreateAppointmentRequest } from "../types/appointment"

export class AppointmentService {
  private static readonly BASE_PATH = "/api/turnos"

  static async createAppointment(request: CreateAppointmentRequest): Promise<Appointment> {
    const response = await api.post<Appointment>(this.BASE_PATH, request)
    return response.data
  }

  // The API only provides POST /api/turnos for creating appointments
  // Other functionality would need to be implemented when those endpoints are available

  static async checkDoctorAvailability(doctorId: number, fechaHora: string): Promise<boolean> {
    try {
      const response = await api.get<boolean>(`/api/medicos/${doctorId}/disponible`, {
        params: { fechaHora },
      })
      return response.data
    } catch (error) {
      console.error("Error checking doctor availability:", error)
      return false
    }
  }
}
