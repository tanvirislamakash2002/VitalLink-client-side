import { z } from "zod"

export const scheduleFieldsSchema = z.object({
  startDate: z.string().date("Choose a valid start date"),
  endDate: z.string().date("Choose a valid end date"),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Choose a valid start time"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Choose a valid end time"),
})

export const scheduleFormSchema = scheduleFieldsSchema.superRefine((values, context) => {
  if (values.endDate < values.startDate) {
    context.addIssue({ code: "custom", path: ["endDate"], message: "End date must be on or after start date" })
  }

  const startMinutes = Number(values.startTime.slice(0, 2)) * 60 + Number(values.startTime.slice(3))
  const endMinutes = Number(values.endTime.slice(0, 2)) * 60 + Number(values.endTime.slice(3))
  if (endMinutes - startMinutes < 30) {
    context.addIssue({ code: "custom", path: ["endTime"], message: "Choose a time range of at least 30 minutes" })
  }
})

export type ScheduleFormValues = z.infer<typeof scheduleFieldsSchema>