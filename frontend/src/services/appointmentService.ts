import { api } from "./api"
import type { Appointment, CreateAppointmentRequest, AppointmentFilters, Page } from "../types/appointment"

export class AppointmentService {
  private static readonly BASE_PATH = "/api/turnos"

  static async getAppointments(filters: AppointmentFilters = {}): Promise<Page<Appointment>> {
    const params = new URLSearchParams()

    if (filters.pacienteId) params.append("pacienteId", filters.pacienteId.toString())
    if (filters.medicoId) params.append("medicoId", filters.medicoId.toString())
    if (filters.estado) params.append("estado", filters.estado)
    if (filters.desde) params.append("desde", filters.desde)
    if (filters.hasta) params.append("hasta", filters.hasta)
    if (filters.page !== undefined) params.append("page", filters.page.toString())
    if (filters.size) params.append("size", filters.size.toString())
    if (filters.sort) params.append("sort", filters.sort)

    const response = await api.get<Page<Appointment>>(`${this.BASE_PATH}?${params.toString()}`)
    return response.data
  }

  static async confirmAppointment(appointmentId: number): Promise<Appointment> {
    const response = await api.patch<Appointment>(`${this.BASE_PATH}/${appointmentId}/confirmar`)
    return response.data
  }

  static async cancelAppointment(appointmentId: number): Promise<Appointment> {
    const response = await api.patch<Appointment>(`${this.BASE_PATH}/${appointmentId}/cancelar`)
    return response.data
  }

  static async createAppointment(request: CreateAppointmentRequest): Promise<Appointment> {
    const response = await api.post<Appointment>(this.BASE_PATH, request)
    return response.data
  }

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
