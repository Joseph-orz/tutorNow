import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BookOpenCheck, GraduationCap, Mail, MessageSquare, Users } from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";

export const metadata: Metadata = {
  title: "Acerca de | tutorNow",
  description:
    "Conoce tutorNow, la plataforma de asesorias academicas entre pares del Politecnico Colombiano Jaime Isaza Cadavid.",
};

const pasos = [
  {
    icon: MessageSquare,
    titulo: "Publica tu solicitud",
    descripcion:
      "Describe la materia, el tema y el horario que necesitas. La solicitud queda visible para los tutores disponibles.",
  },
  {
    icon: GraduationCap,
    titulo: "Los tutores se postulan",
    descripcion:
      "Los tutores pares revisan la solicitud y envian una propuesta comparable con su disponibilidad y enfoque.",
  },
  {
    icon: BookOpenCheck,
    titulo: "Coordinan la asesoria",
    descripcion:
      "El estudiante elige la mejor propuesta y ambos coordinan los detalles a traves del chat interno.",
  },
];

export default function AboutPage() {
  return (
    <main className="flex min-h-screen flex-col bg-bg-primary">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border-color bg-gradient-to-br from-[var(--hero-from)] to-[var(--hero-to)] px-4 py-16 text-white md:py-24">
        <div
          className="absolute left-4 z-20"
          style={{ top: "calc(1rem + env(safe-area-inset-top, 0px))" }}
        >
          <BackButton />
        </div>
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 text-center">
          <Image
            src="/logo-pjic.png"
            alt="Politecnico Jaime Isaza Cadavid"
            width={96}
            height={96}
            className="h-20 w-20 rounded-2xl object-cover shadow-lg md:h-24 md:w-24"
            priority
          />
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">Acerca de tutorNow</h1>
          <p className="max-w-2xl text-base text-white/85 md:text-lg">
            Plataforma colaborativa de asesorias academicas entre pares del Politecnico Colombiano
            Jaime Isaza Cadavid. Conectamos estudiantes que necesitan apoyo con tutores pares que
            pueden ayudarlos.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex min-h-[44px] items-center rounded-lg bg-white/15 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white"
            >
              Iniciar sesion
            </Link>
            <Link
              href="/register"
              className="inline-flex min-h-[44px] items-center rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[var(--hero-from)] transition-colors hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* Que es */}
      <section className="px-4 py-12 md:py-16">
        <div className="mx-auto w-full max-w-4xl">
          <h2 className="mb-4 text-2xl font-semibold text-text-main md:text-3xl">Que es tutorNow</h2>
          <p className="text-base leading-relaxed text-text-muted md:text-lg">
            tutorNow es una plataforma web que facilita el encuentro entre estudiantes que necesitan
            apoyo academico y tutores pares dispuestos a ayudar. Los estudiantes publican solicitudes
            estructuradas y los tutores se postulan con propuestas comparables. El estudiante selecciona
            manualmente la mejor propuesta y ambos coordinan la asesoria mediante un chat interno.
          </p>
        </div>
      </section>

      {/* Como funciona */}
      <section className="bg-bg-surface px-4 py-12 md:py-16">
        <div className="mx-auto w-full max-w-4xl">
          <h2 className="mb-8 text-2xl font-semibold text-text-main md:text-3xl">Como funciona</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {pasos.map((paso) => (
              <article
                key={paso.titulo}
                className="flex flex-col gap-3 rounded-2xl border border-border-color bg-bg-primary p-6 shadow-sm transition-colors duration-300"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-poli/10 text-brand-poli">
                  <paso.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="text-lg font-semibold text-text-main">{paso.titulo}</h3>
                <p className="text-sm leading-relaxed text-text-muted">{paso.descripcion}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Stack */}
      <section className="px-4 py-12 md:py-16">
        <div className="mx-auto w-full max-w-4xl">
          <h2 className="mb-4 text-2xl font-semibold text-text-main md:text-3xl">Tecnologia</h2>
          <p className="mb-6 text-base text-text-muted">
            Construido con un stack moderno para ofrecer una experiencia rapida y confiable.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            <li className="rounded-xl border border-border-color bg-bg-surface px-4 py-3 text-sm text-text-main">
              Frontend: Next.js (App Router), React, TypeScript, Tailwind CSS
            </li>
            <li className="rounded-xl border border-border-color bg-bg-surface px-4 py-3 text-sm text-text-main">
              Estado: Zustand
            </li>
            <li className="rounded-xl border border-border-color bg-bg-surface px-4 py-3 text-sm text-text-main">
              Backend: Spring Boot 3, Spring Modulith, Spring Security
            </li>
            <li className="rounded-xl border border-border-color bg-bg-surface px-4 py-3 text-sm text-text-main">
              Base de datos: PostgreSQL 15+
            </li>
          </ul>
        </div>
      </section>

      {/* Equipo y contacto */}
      <section className="bg-bg-surface px-4 py-12 md:py-16">
        <div className="mx-auto w-full max-w-4xl">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-text-main md:text-3xl">
                <Users className="h-6 w-6 text-brand-poli" aria-hidden="true" />
                Equipo
              </h2>
              <p className="text-base leading-relaxed text-text-muted">
                tutorNow es desarrollado por estudiantes del Politecnico Colombiano Jaime Isaza
                Cadavid como proyecto integrador. El equipo de desarrollo trabaja de forma
                colaborativa para mejorar la experiencia academica de la comunidad universitaria.
              </p>
            </div>
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-text-main md:text-3xl">
                <Mail className="h-6 w-6 text-brand-poli" aria-hidden="true" />
                Contacto
              </h2>
              <p className="mb-3 text-base leading-relaxed text-text-muted">
                Para consultas, sugerencias o reportes, comunicate con el equipo a traves del correo
                institucional.
              </p>
              <a
                href="mailto:contacto@elpoli.edu.co"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg px-2 text-sm font-semibold text-brand-poli transition-colors hover:bg-brand-poli/10 focus:outline-none focus:ring-2 focus:ring-brand-poli"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                contacto@elpoli.edu.co
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-4 py-12 md:py-16">
        <div className="mx-auto w-full max-w-4xl rounded-2xl border border-border-color bg-gradient-to-br from-[var(--hero-from)] to-[var(--hero-to)] p-8 text-center text-white shadow-sm">
          <h2 className="mb-3 text-2xl font-semibold">Listo para empezar?</h2>
          <p className="mb-6 text-white/85">
            Crea tu cuenta con tu correo institucional y comienza a usar tutorNow.
          </p>
          <Link
            href="/register"
            className="inline-flex min-h-[44px] items-center rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-[var(--hero-from)] transition-colors hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white"
          >
            Crear cuenta
          </Link>
        </div>
      </section>
    </main>
  );
}
