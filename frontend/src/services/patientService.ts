import { api } from "./api"
import type { Patient } from "../types/appointment"

export class PatientService {
  private static readonly BASE_PATH = "/patients"

  static async getPatients(): Promise<Patient[]> {
    const response = await api.get<Patient[]>(this.BASE_PATH)
    return response.data
  }

  static async getPatientById(id: string): Promise<Patient> {
    const response = await api.get<Patient>(`${this.BASE_PATH}/${id}`)
    return response.data
  }

  static async searchPatients(query: string): Promise<Patient[]> {
    const response = await api.get<Patient[]>(`${this.BASE_PATH}/search`, {
      params: { q: query },
    })
    return response.data
  }
}
