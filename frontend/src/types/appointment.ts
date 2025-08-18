export interface Patient {
  id: number
  nombre: string
  email: string
  telefono: string | null
  activo: boolean
}

export interface Doctor {
  id: number
  nombre: string
  especialidad: string
  activo: boolean
}

export interface Appointment {
  id: number
  pacienteId: number
  medicoId: number
  fechaHora: string // ISO datetime string
  estado: EstadoTurno
  creadoEn?: string // ISO datetime string
  patient?: Patient
  doctor?: Doctor
}

export enum EstadoTurno {
  CONFIRMADO = "CONFIRMADO",
  CANCELADO = "CANCELADO",
  COMPLETADO = "COMPLETADO",
  NO_SHOW = "NO_SHOW",
}

export enum AppointmentStatus {
  SCHEDULED = "CONFIRMADO", // Maps to backend's CONFIRMADO
  CONFIRMED = "CONFIRMADO",
  CANCELLED = "CANCELADO",
  COMPLETED = "COMPLETADO",
  NO_SHOW = "NO_SHOW",
}

export interface CreateAppointmentRequest {
  pacienteId: number
  medicoId: number
  fechaHora: string // ISO datetime string format
}

export interface CreatePatientRequest {
  nombre: string
  email: string
  telefono?: string
}

export interface CreateDoctorRequest {
  nombre: string
  especialidad: string
  activo: boolean
}

export interface UpdateAppointmentRequest {
  appointmentDate?: string
  appointmentTime?: string
  reason?: string
  notes?: string
  status?: string
}

export interface AppointmentFilters {
  pacienteId?: number
  medicoId?: number
  estado?: string
  dateFrom?: string
  dateTo?: string
}
