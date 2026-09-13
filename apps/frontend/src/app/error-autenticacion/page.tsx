import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import { StatusMessage } from '@/components/auth/form-controls';
import { getAuthQueryErrorMessage } from '@/lib/auth-errors';

export default async function AuthErrorPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const message = getAuthQueryErrorMessage(error) ?? 'No pudimos completar el acceso con ese enlace.';
  return <AuthShell title="Acceso interrumpido" intro="El intento de autenticación no pudo terminar."><StatusMessage>{message}</StatusMessage><Link className="mt-6 flex h-12 items-center justify-center rounded-md bg-[#102a43] px-5 font-bold text-white hover:bg-[#173f64]" href="/iniciar-sesion">Volver a iniciar sesión</Link></AuthShell>;
}
