import { api } from "./api"
import type { Doctor } from "../types/appointment"

export class DoctorService {
  private static readonly BASE_PATH = "/doctors"

  static async getDoctors(): Promise<Doctor[]> {
    const response = await api.get<Doctor[]>(this.BASE_PATH)
    return response.data
  }

  static async getDoctorById(id: string): Promise<Doctor> {
    const response = await api.get<Doctor>(`${this.BASE_PATH}/${id}`)
    return response.data
  }

  static async getDoctorsBySpecialty(specialty: string): Promise<Doctor[]> {
    const response = await api.get<Doctor[]>(`${this.BASE_PATH}/specialty/${specialty}`)
    return response.data
  }
}
