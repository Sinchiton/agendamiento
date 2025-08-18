import { api } from "./api"
import type { Patient, CreatePatientRequest } from "../types/appointment"

export class PatientService {
  private static readonly BASE_PATH = "/api/pacientes"

  static async createPatient(request: CreatePatientRequest): Promise<Patient> {
    const response = await api.post<Patient>(this.BASE_PATH, request)
    return response.data
  }

  static async getPatientById(id: number): Promise<Patient> {
    const response = await api.get<Patient>(`${this.BASE_PATH}/${id}`)
    return response.data
  }

  static async getAllPatients(): Promise<Patient[]> {
    const response = await api.get<Patient[]>(this.BASE_PATH)
    return response.data
  }
}

export const createPatient = (request: CreatePatientRequest): Promise<Patient> => {
  return PatientService.createPatient(request)
}

export const getPatientById = (id: number): Promise<Patient> => {
  return PatientService.getPatientById(id)
}

export const getAllPatients = (): Promise<Patient[]> => {
  return PatientService.getAllPatients()
}
