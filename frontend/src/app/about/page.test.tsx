import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AboutPage from './page';

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('AboutPage', () => {
  it('renderiza el titulo principal', () => {
    render(<AboutPage />);
    expect(screen.getByRole('heading', { name: /acerca de tutornow/i })).toBeInTheDocument();
  });

  it('muestra las secciones clave', () => {
    render(<AboutPage />);
    expect(screen.getByRole('heading', { name: /que es tutornow/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /como funciona/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /tecnologia/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /equipo/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /contacto/i })).toBeInTheDocument();
  });

  it('enlaza a login y registro', () => {
    render(<AboutPage />);
    expect(screen.getByRole('link', { name: /iniciar sesion/i })).toHaveAttribute('href', '/login');
    expect(screen.getAllByRole('link', { name: /crear cuenta/i })[0]).toHaveAttribute('href', '/register');
  });
});
