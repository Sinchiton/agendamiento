import { api } from "./api"
import type {
  Appointment,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  AppointmentFilters,
} from "../types/appointment"

export class AppointmentService {
  private static readonly BASE_PATH = "/appointments"

  static async createAppointment(request: CreateAppointmentRequest): Promise<Appointment> {
    const response = await api.post<Appointment>(this.BASE_PATH, request)
    return response.data
  }

  static async getAppointments(filters?: AppointmentFilters): Promise<Appointment[]> {
    const params = new URLSearchParams()

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          params.append(key, value.toString())
        }
      })
    }

    const response = await api.get<Appointment[]>(`${this.BASE_PATH}?${params}`)
    return response.data
  }

  static async getAppointmentById(id: string): Promise<Appointment> {
    const response = await api.get<Appointment>(`${this.BASE_PATH}/${id}`)
    return response.data
  }

  static async updateAppointment(id: string, request: UpdateAppointmentRequest): Promise<Appointment> {
    const response = await api.put<Appointment>(`${this.BASE_PATH}/${id}`, request)
    return response.data
  }

  static async cancelAppointment(id: string, reason?: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/${id}`, {
      data: { reason },
    })
  }

  static async getAvailableSlots(doctorId: string, date: string): Promise<string[]> {
    const response = await api.get<string[]>(`${this.BASE_PATH}/available-slots`, {
      params: { doctorId, date },
    })
    return response.data
  }
}
