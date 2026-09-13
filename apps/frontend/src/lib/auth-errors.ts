import type { AuthApiError } from './auth-types';

const messages: Record<string, string> = {
  EMAIL_NOT_VERIFIED: 'Verifica tu correo antes de iniciar sesión.',
  INVALID_EMAIL_OR_PASSWORD: 'El correo o la contraseña no coinciden.',
  INVALID_TOKEN: 'Este enlace ya no es válido. Solicita uno nuevo.',
  TOKEN_EXPIRED: 'Este enlace expiró. Solicita uno nuevo.',
  PASSWORD_TOO_SHORT: 'La contraseña debe tener al menos 8 caracteres.',
  PASSWORD_TOO_LONG: 'La contraseña no puede superar 128 caracteres.',
  USER_ALREADY_EXISTS: 'Ya existe una cuenta con este correo.',
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: 'Ya existe una cuenta con este correo.',
  FAILED_TO_CREATE_SESSION: 'No pudimos iniciar tu sesión. Inténtalo de nuevo.',
  TOO_MANY_REQUESTS: 'Has hecho demasiados intentos. Espera un momento y vuelve a intentar.'
};

export function getAuthErrorMessage(error?: AuthApiError | null): string {
  if (!error) return 'No pudimos completar la acción. Inténtalo de nuevo.';
  const knownMessage = error.code ? messages[error.code] : undefined;
  if (knownMessage) return knownMessage;
  return 'No pudimos completar la acción. Revisa tus datos e inténtalo de nuevo.';
}

export function getAuthQueryErrorMessage(code?: string | null): string | null {
  if (!code) return null;
  return messages[code] ?? 'El enlace no pudo completarse. Inténtalo de nuevo.';
}
