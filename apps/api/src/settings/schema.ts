import { z } from "zod";

export const deleteSchema = z.object({
  id: z.string().uuid("Invalid id"),
});
export type deleteSchema = typeof deleteSchema;

export const formSchema = z.object({
  taskName: z.string().min(2).max(50),
  startTime: z
    .string()
    .min(1, "Required field")
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
  endTime: z
    .string()
    .min(1, "Required field")
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
});
export type FormSchema = typeof formSchema;

export const editFormSchema = z.object({
  id: z.string().min(1, "Required field"),
  taskName: z.string().min(2).max(50),
  startTime: z
    .string()
    .min(1, "Required field")
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
  endTime: z
    .string()
    .min(1, "Required field")
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
});
export type EditFormSchema = typeof editFormSchema;
