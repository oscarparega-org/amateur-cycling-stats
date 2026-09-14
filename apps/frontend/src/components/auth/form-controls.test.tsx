import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FormField, PasswordField } from './form-controls';

describe('auth form controls', () => {
  it('connects validation errors to their input', () => {
    render(<FormField id="email" label="Correo" error="Correo inválido" />);
    const input = screen.getByLabelText('Correo');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Correo inválido');
  });

  it('toggles password visibility with an accessible control', () => {
    render(<PasswordField id="password" label="Contraseña" />);
    const input = screen.getByLabelText('Contraseña');
    expect(input).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toBeVisible();
  });
});
