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
  EXTRA = "EXTRA", // Added new EXTRA state from backend
  CANCELADO = "CANCELADO",
  COMPLETADO = "COMPLETADO",
  NO_SHOW = "NO_SHOW",
}

export enum AppointmentStatus {
  SCHEDULED = "CONFIRMADO", // Maps to backend's CONFIRMADO
  CONFIRMED = "CONFIRMADO",
  EXTRA = "EXTRA", // Added EXTRA status mapping
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
  status?: string
}

export interface AppointmentFilters {
  pacienteId?: number
  medicoId?: number
  estado?: EstadoTurno
  desde?: string // ISO datetime
  hasta?: string // ISO datetime
  page?: number
  size?: number
  sort?: string // e.g., "fechaHora,desc"
}

export interface DoctorSchedule {
  dia: DayOfWeek
  inicio: string // HH:mm format
  fin: string // HH:mm format
}

export enum DayOfWeek {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}

export interface CreateScheduleRequest {
  schedules: DoctorSchedule[]
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
  numberOfElements: number
  sort: {
    sorted: boolean
    unsorted: boolean
    empty: boolean
  }
}
