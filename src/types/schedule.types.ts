export interface ISchedule {
  id: string
  startDateTime: Date | string
  endDateTime: Date | string
  createdAt?: Date | string
  updatedAt?: Date | string
  doctorSchedules: Array<{
    doctorId: string
    scheduleId: string
    isBooked: boolean
    doctor: {
      name: string
      email: string
    }
  }>
  appointments: Array<{
    id: string
    status: string
    paymentStatus: string
    patient: {
      name: string
      email: string
    }
  }>
}

export interface IDoctorSchedule {
  doctorId: string
  scheduleId: string
  isBooked: boolean
  schedule: {
    id: string
    startDateTime: Date | string
    endDateTime: Date | string
  }
}

export interface ScheduleFormPayload {
  startDate: string
  endDate: string
  startTime: string
  endTime: string
}