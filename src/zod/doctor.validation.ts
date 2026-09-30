import { z } from "zod"

export const createDoctorPayloadSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters").max(20, "Password must be at most 20 characters"),
  doctor: z.object({
    name: z.string().min(5, "Name must be at least 5 characters").max(30, "Name must be at most 30 characters"),
    email: z.email("Enter a valid email address"),
    registrationNumber: z.string().min(2, "Registration number is required").max(50),
    contactNumber: z.string().min(11, "Enter a valid contact number").max(14, "Contact number is too long"),
    address: z.string().optional(),
    experience: z.number().int("Experience must be a whole number").nonnegative("Experience cannot be negative"),
    gender: z.enum(["MALE", "FEMALE"]),
    appointmentFee: z.number().nonnegative("Fee cannot be negative"),
    qualification: z.string().min(2).max(50),
    currentWorkingPlace: z.string().min(2).max(50),
    designation: z.string().min(2).max(50),
  }),
  specialties: z.array(z.uuid("Choose a valid specialty")).min(1, "Choose at least one specialty"),
})

export const createDoctorFormSchema = z.object({
  name: createDoctorPayloadSchema.shape.doctor.shape.name,
  email: createDoctorPayloadSchema.shape.doctor.shape.email,
  password: createDoctorPayloadSchema.shape.password,
  registrationNumber: createDoctorPayloadSchema.shape.doctor.shape.registrationNumber,
  contactNumber: createDoctorPayloadSchema.shape.doctor.shape.contactNumber,
  address: z.string().refine((value) => value === "" || value.length >= 10, "Address must be at least 10 characters").max(100, "Address must be at most 100 characters"),
  experience: z.string().min(1, "Experience is required").refine((value) => Number.isInteger(Number(value)) && Number(value) >= 0, "Enter a whole number of years"),
  gender: z.string().min(1, "Choose a gender"),
  appointmentFee: z.string().min(1, "Appointment fee is required").refine((value) => Number.isFinite(Number(value)) && Number(value) >= 0, "Enter a valid fee"),
  qualification: createDoctorPayloadSchema.shape.doctor.shape.qualification,
  currentWorkingPlace: createDoctorPayloadSchema.shape.doctor.shape.currentWorkingPlace,
  designation: createDoctorPayloadSchema.shape.doctor.shape.designation,
  specialties: createDoctorPayloadSchema.shape.specialties,
})

export type CreateDoctorFormValues = z.infer<typeof createDoctorFormSchema>
export type CreateDoctorPayload = z.infer<typeof createDoctorPayloadSchema>