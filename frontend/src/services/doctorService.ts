import { api } from "./api"
import type { Doctor, CreateDoctorRequest, DoctorSchedule } from "../types/appointment"

export class DoctorService {
  private static readonly BASE_PATH = "/api/medicos"

  static async createDoctor(request: CreateDoctorRequest): Promise<Doctor> {
    const response = await api.post<Doctor>(this.BASE_PATH, request)
    return response.data
  }

  static async getDoctorById(id: number): Promise<Doctor> {
    const response = await api.get<Doctor>(`${this.BASE_PATH}/${id}`)
    return response.data
  }

  static async getAllDoctors(): Promise<Doctor[]> {
    const response = await api.get<Doctor[]>(this.BASE_PATH)
    return response.data
  }

  static async checkAvailability(id: number, fechaHora: string): Promise<boolean> {
    const response = await api.get<boolean>(`${this.BASE_PATH}/${id}/disponible`, {
      params: { fechaHora },
    })
    return response.data
  }

  static async getDoctorSchedules(id: number): Promise<DoctorSchedule[]> {
    const response = await api.get<DoctorSchedule[]>(`${this.BASE_PATH}/${id}/horarios`)
    return response.data
  }

  static async updateDoctorSchedules(id: number, schedules: DoctorSchedule[]): Promise<DoctorSchedule[]> {
    const response = await api.put<DoctorSchedule[]>(`${this.BASE_PATH}/${id}/horarios`, schedules)
    return response.data
  }
}

export const createDoctor = (request: CreateDoctorRequest): Promise<Doctor> => {
  return DoctorService.createDoctor(request)
}

export const getDoctorById = (id: number): Promise<Doctor> => {
  return DoctorService.getDoctorById(id)
}

export const checkAvailability = (id: number, fechaHora: string): Promise<boolean> => {
  return DoctorService.checkAvailability(id, fechaHora)
}

export const getAllDoctors = (): Promise<Doctor[]> => {
  return DoctorService.getAllDoctors()
}

export const getDoctorSchedules = (id: number): Promise<DoctorSchedule[]> => {
  return DoctorService.getDoctorSchedules(id)
}

export const updateDoctorSchedules = (id: number, schedules: DoctorSchedule[]): Promise<DoctorSchedule[]> => {
  return DoctorService.updateDoctorSchedules(id, schedules)
}
