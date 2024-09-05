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

export const registerSchema = z
  .object({
    username: z.string().min(2).max(20),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .refine((value) => /[A-Z]/.test(value), {
        message: "Password must contain at least one uppercase letter",
      })
      .refine((value) => /[a-z]/.test(value), {
        message: "Password must contain at least one lowercase letter",
      })
      .refine((value) => /[0-9]/.test(value), {
        message: "Password must contain at least one number",
      })
      .refine((value) => /[!@#$%^&*(),.?":{}|<>]/.test(value), {
        message: "Password must contain at least one special character",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export type RegisterSchema = typeof registerSchema;

export const loginSchema = z.object({
  username: z.string().min(2).max(20),
  password: z.string().min(8).max(20),
});
export type Loginschema = typeof loginSchema;
