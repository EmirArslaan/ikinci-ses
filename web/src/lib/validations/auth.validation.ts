import { z } from 'zod';

// Register validation schema
export const registerSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
  password: z.string()
    .min(6, 'Şifre en az 6 karakter olmalıdır')
    .max(100, 'Şifre en fazla 100 karakter olabilir'),
  name: z.string()
    .min(2, 'İsim en az 2 karakter olmalıdır')
    .max(100, 'İsim en fazla 100 karakter olabilir'),
  phone: z.string()
    .regex(/^(\+90|0)?5\d{9}$/, 'Geçerli bir Türkiye telefon numarası giriniz')
    .optional(),
});

// Login validation schema
export const loginSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
  password: z.string().min(1, 'Şifre zorunludur'),
});

// Email verification schema
export const verifyEmailSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
  code: z.string()
    .length(6, 'Doğrulama kodu 6 haneli olmalıdır')
    .regex(/^\d+$/, 'Doğrulama kodu sadece rakamlardan oluşmalıdır'),
});

// Phone verification schema
export const verifyPhoneSchema = z.object({
  phone: z.string().regex(/^(\+90|0)?5\d{9}$/, 'Geçerli bir Türkiye telefon numarası giriniz'),
  code: z.string()
    .length(6, 'Doğrulama kodu 6 haneli olmalıdır')
    .regex(/^\d+$/, 'Doğrulama kodu sadece rakamlardan oluşmalıdır'),
});

// Send email verification code schema
export const sendEmailVerificationSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
});

// Send phone verification code schema
export const sendPhoneVerificationSchema = z.object({
  phone: z.string().regex(/^(\+90|0)?5\d{9}$/, 'Geçerli bir Türkiye telefon numarası giriniz'),
});

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mevcut şifre zorunludur'),
  newPassword: z.string()
    .min(6, 'Yeni şifre en az 6 karakter olmalıdır')
    .max(100, 'Yeni şifre en fazla 100 karakter olabilir'),
});

// Update profile schema
export const updateProfileSchema = z.object({
  name: z.string()
    .min(2, 'İsim en az 2 karakter olmalıdır')
    .max(100, 'İsim en fazla 100 karakter olabilir')
    .optional(),
  phone: z.string()
    .regex(/^(\+90|0)?5\d{9}$/, 'Geçerli bir Türkiye telefon numarası giriniz')
    .optional(),
  avatar: z.string().url('Geçerli bir URL giriniz').optional(),
});

// Types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type VerifyPhoneInput = z.infer<typeof verifyPhoneSchema>;
export type SendEmailVerificationInput = z.infer<typeof sendEmailVerificationSchema>;
export type SendPhoneVerificationInput = z.infer<typeof sendPhoneVerificationSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
