import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import { StatusMessage } from '@/components/auth/form-controls';
import { getAuthQueryErrorMessage } from '@/lib/auth-errors';
import { getServerSession } from '@/lib/backend';

export default async function EmailVerifiedPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const message = getAuthQueryErrorMessage(error);
  const session = await getServerSession();
  return <AuthShell title={message ? 'El enlace no funcionó' : 'Correo confirmado'} intro={message ? 'Puedes solicitar un enlace nuevo para completar la verificación.' : 'Tu cuenta está lista. Ya puedes seguir tu próxima carrera.'}>
    {message ? <><StatusMessage>{message}</StatusMessage><Link className="mt-6 flex h-12 items-center justify-center rounded-md bg-[#102a43] px-5 font-bold text-white hover:bg-[#173f64]" href="/verifica-tu-correo">Solicitar otro enlace</Link></> : <><StatusMessage kind="success">Tu correo quedó verificado correctamente.</StatusMessage><Link className="mt-6 flex h-12 items-center justify-center rounded-md bg-[#102a43] px-5 font-bold text-white hover:bg-[#173f64]" href={session ? '/' : '/iniciar-sesion'}>{session ? 'Ir al inicio' : 'Iniciar sesión'}</Link></>}
  </AuthShell>;
}
