export interface Patient {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  documentNumber: string
  birthDate: string
}

export interface Doctor {
  id: string
  firstName: string
  lastName: string
  specialty: string
  licenseNumber: string
}

export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  appointmentDate: string
  appointmentTime: string
  status: AppointmentStatus
  reason: string
  notes?: string
  createdAt: string
  updatedAt: string
  patient?: Patient
  doctor?: Doctor
}

export enum AppointmentStatus {
  SCHEDULED = "SCHEDULED",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
  NO_SHOW = "NO_SHOW",
}

export interface CreateAppointmentRequest {
  patientId: string
  doctorId: string
  appointmentDate: string
  appointmentTime: string
  reason: string
  notes?: string
}

export interface UpdateAppointmentRequest {
  appointmentDate?: string
  appointmentTime?: string
  reason?: string
  notes?: string
  status?: AppointmentStatus
}

export interface AppointmentFilters {
  patientId?: string
  doctorId?: string
  status?: AppointmentStatus
  dateFrom?: string
  dateTo?: string
}
