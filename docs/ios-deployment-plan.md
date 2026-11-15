# Plan de despliegue iOS — tutorNow (costo $0, sin App Store)

> **Estado**: Borrador v1 — pendiente de aprobación del equipo
> **Base**: `docs/mobile-migration-plan.md` (Capacitor, Android v1 ya en curso)
> **Objetivo**: poder probar tutorNow en un iPhone real **sin Mac propio, sin Apple Developer Program ($99) y sin publicar en App Store**.
> **Última actualización**: 2026-11-15

---

## 0. Restricciones y realidad técnica

| Restricción | Implicación |
|---|---|
| Máquina de desarrollo en Windows | No se puede compilar iOS localmente (Xcode solo macOS) |
| Presupuesto $0 | Sin Mac, sin Apple Developer Program, sin servicios cloud pagos |
| No se requiere App Store | Se distribuye por sideload / PWA, no por TestFlight ni App Store |
| Backend actual en `http://localhost:8080` | iOS ATS exige HTTPS al backend (bloqueante) |

**Conclusión**: la única forma gratuita de obtener un `.ipa` es usar los runners macOS de GitHub Actions. La única forma gratuita de instalarlo en un iPhone es el sideload con una cuenta Apple gratuita (Sideloadly/AltStore), que expira a los 7 días.

---

## 1. Estrategia en 3 capas (de más rápida a más "nativa")

| Capa | Qué es | Costo | Esfuerzo | Cuándo usar |
|---|---|---|---|---|
| **0 — PWA** | Web app instalable desde Safari | $0 | 1 día | Validar UX/flujo hoy mismo, sin compilar nada |
| **1 — Capacitor iOS + sideload** | `.ipa` unsigned vía CI + Sideloadly/AltStore | $0 | 3-5 días | Probar plugins nativos y sensación de app real |
| **2 — Simulador web** | Subir el `.ipa` a Appetize.io / BrowserStack | $0 (free tier) | 1 día | QA en iPhone sin tener el dispositivo a mano |

Se recomienda empezar por la **Capa 0** (inmediata) mientras se prepara la **Capa 1**.

---

## 2. Capa 0 — PWA (inmediata, $0)

### 2.1 Despliegue del frontend

- Build estático: `npm run build:web` (ya genera `out/`).
- Hosting gratuito: **Vercel**, **Netlify** o **GitHub Pages**.
- Variables de entorno en el host: `NEXT_PUBLIC_API_URL` apuntando al backend HTTPS.

### 2.2 Backend accesible por HTTPS (bloqueante)

Opciones gratuitas (elegir una):

| Opción | Pros | Contras |
|---|---|---|
| **Render (free web service)** | HTTPS automático, fácil | Se duerme tras 15 min de inactividad |
| **Railway (trial)** | Simple | Créditos limitados |
| **Fly.io (free allowance)** | No se duerme tanto | Config más manual |
| **Cloudflare Tunnel / ngrok** | Backend local expuesto por HTTPS | URL cambia cada reinicio (ngrok free) |

Base de datos: **Neon** o **Supabase** (free tier PostgreSQL) o túnel al Postgres local.

### 2.3 Instalación en iPhone

1. Abrir la URL en Safari (no Chrome: solo Safari soporta "Añadir a pantalla de inicio" como app).
2. Compartir → "Añadir a pantalla de inicio".
3. La app queda con ícono y se abre en modo standalone.

### 2.4 Limitaciones de la PWA

- Sin plugins nativos de Capacitor (cámara nativa, push, biometría). La cámara vía `getUserMedia` funciona en Safari con permisos.
- Sin splash nativo ni deep links universales.
- Almacenamiento: Safari puede purgar datos; el token JWT en `localStorage` puede perderse. Para pruebas cortas es aceptable.

---

## 3. Capa 1 — Capacitor iOS + sideload gratuito

### 3.1 Prerrequisito único: generar la plataforma `ios/`

`npx cap add ios` requiere macOS (usa templates de Xcode). Opciones:

**Opción A — Mac prestado (recomendada, una sola vez)**
1. En el Mac: `cd frontend && npx cap add ios`.
2. Configurar (sección 3.2).
3. Commit de `frontend/ios/` a la rama `feature/mobile-capacitor`.
4. A partir de ahí, todo el build se hace en CI (Windows no necesita Mac).

**Opción B — Bootstrap en CI (sin Mac)**
Workflow de un solo uso en GitHub Actions (`macos-latest`) que ejecuta `npx cap add ios`, aplica el patch de config y abre un PR. Más frágil; solo si no hay Mac disponible.

### 3.2 Configuración de Capacitor para iOS

Editar `frontend/capacitor.config.ts` (añadir bloque `ios` y mantener `server`):

```ts
const config: CapacitorConfig = {
  appId: 'com.tutornow.app',
  appName: 'tutorNow',
  webDir: 'out',
  server: {
    androidScheme: 'http',   // solo Android (mixed content)
    cleartext: true,          // solo Android
    // iOS usa el scheme por defecto (capacitor://) y exige HTTPS al backend
  },
  ios: {
    scheme: 'App',
  },
  plugins: { /* ... existente ... */ },
};
```

### 3.3 Workflow de build (`.github/workflows/ios.yml`)

```yaml
name: iOS Build (unsigned)

on:
  workflow_dispatch:
  # No se dispara en cada push: los runners macOS cuestan 10x minutos

jobs:
  build-ios:
    name: Build unsigned IPA
    runs-on: macos-latest
    timeout-minutes: 45

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: frontend/package-lock.json

      - name: Install frontend dependencies
        working-directory: frontend
        run: npm ci

      - name: Build Next.js static export
        working-directory: frontend
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.BACKEND_URL }}
        run: npm run build:web

      - name: Sync Capacitor
        working-directory: frontend
        run: npx cap sync ios

      - name: Select Xcode
        run: sudo xcode-select -s /Applications/Xcode.app

      - name: Build unsigned archive
        working-directory: frontend/ios/App
        run: |
          xcodebuild \
            -workspace App.xcworkspace \
            -scheme App \
            -configuration Release \
            -sdk iphoneos \
            -destination 'generic/platform=iOS' \
            -archivePath $RUNNER_TEMP/App.xcarchive \
            archive \
            CODE_SIGNING_ALLOWED=NO \
            CODE_SIGNING_REQUIRED=NO

      - name: Package unsigned IPA
        run: |
          mkdir -p $RUNNER_TEMP/Payload
          cp -R $RUNNER_TEMP/App.xcarchive/Products/Applications/App.app $RUNNER_TEMP/Payload/
          cd $RUNNER_TEMP
          zip -r App-unsigned.ipa Payload

      - name: Upload IPA artifact
        uses: actions/upload-artifact@v4
        with:
          name: app-unsigned-ipa
          path: ${{ runner.temp }}/App-unsigned.ipa
          retention-days: 14
```

**Notas de costo**: un build consume ~10-20 min de runner macOS = 100-200 min del free tier. Con 2000 min/mes (Linux equivalente) alcanza para ~10-20 builds. Disparar solo manualmente (`workflow_dispatch`) y cachear CocoaPods.

### 3.4 Instalación en iPhone (sideload gratuito)

Herramientas (en Windows, $0):

| Herramienta | Cómo funciona |
|---|---|
| **Sideloadly** | Instala el `.ipa` firmándolo con tu Apple ID gratuito por USB/Wi-Fi |
| **AltStore + AltServer** | App store alternativo; refresca automáticamente cada 7 días si AltServer corre en la PC |

Pasos:
1. Descargar el artifact `app-unsigned-ipa` desde GitHub Actions (válido 14 días).
2. Abrir Sideloadly/AltStore, conectar el iPhone (USB o misma red Wi-Fi).
3. Ingresar un Apple ID gratuito (se recomienda uno dedicado, no el personal).
4. Instalar `App-unsigned.ipa`.
5. En el iPhone: Ajustes → General → VPN y gestión de dispositivos → confiar en el desarrollador.

### 3.5 Limitaciones sin Apple Developer Program

- **Expiración a 7 días**: la firma gratuita caduca; hay que refrescar con Sideloadly/AltServer.
- **Máx. 3 apps sideloaded** por Apple ID gratuito simultáneamente.
- **Sin push notifications (APNs)**: requiere certificado de Apple Developer.
- **Sin TestFlight ni App Store**: no se puede distribuir a terceros de forma sencilla.
- **Deep links por scheme custom** (`tutornow://`) funcionan; universal links requieren dominio verificado + cuenta de pago.
- **Biometría / cámara nativa**: requieren permisos en `Info.plist` (se agregan al generar `ios/`).

---

## 4. Capa 2 — Simulador en navegador (opcional)

- **Appetize.io** (free tier ~100 min/mes): subir el `.ipa` y probar en un iPhone simulado desde el navegador. Útil para QA sin dispositivo.
- **BrowserStack / LambdaTest**: trials gratuitos con dispositivos reales en la nube.

---

## 5. Checklist de implementación (orden sugerido)

### Fase I0 — Desbloquear pruebas inmediatas (1-2 días)
- [ ] Desplegar frontend estático en Vercel/Netlify.
- [ ] Exponer backend por HTTPS (Render free o túnel).
- [ ] Migrar Postgres a Neon/Supabase free o túnel.
- [ ] Probar PWA en iPhone (Capa 0).

### Fase I1 — Plataforma iOS (1 día + acceso a Mac)
- [ ] Generar `frontend/ios/` (`npx cap add ios`) en Mac prestado o bootstrap CI.
- [ ] Actualizar `capacitor.config.ts` (bloque `ios`).
- [ ] Agregar permisos a `Info.plist` (cámara, fotos) si aplica.
- [ ] Commit de `ios/`.

### Fase I2 — Build en CI (1-2 días)
- [ ] Crear `.github/workflows/ios.yml`.
- [ ] Configurar secret `BACKEND_URL` con la URL HTTPS.
- [ ] Disparar build manual y descargar el `.ipa`.

### Fase I3 — Sideload y validación (1 día)
- [ ] Instalar con Sideloadly/AltStore en iPhone de prueba.
- [ ] Smoke test: login, navegación, chat, persistencia de sesión tras reinicio.
- [ ] Documentar el proceso de refresh de 7 días para el equipo.

---

## 6. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| No hay Mac para generar `ios/` | Alta | Alto | Bootstrap en CI (Opción B) o pedir Mac prestado una sola vez |
| Backend sin HTTPS | Alta | Alto | Usar Render/Cloudflare Tunnel antes de probar en iPhone |
| `.ipa` expira en 14 días en GitHub | Media | Bajo | Re-disparar workflow; guardar copia local |
| Firma gratuita caduca a los 7 días | Alta | Medio | AltServer en PC para refresh automático; recordatorio semanal |
| App rechazada por Apple (si algún día se publica) | Media | Alto | Agregar features nativas (push/cámara) antes de enviar a App Store |
| Free tier de GitHub macOS insuficiente | Media | Medio | Limitar builds a `workflow_dispatch`; cachear pods |

---

## 7. Decisiones pendientes

1. **¿Hay Mac prestado disponible** para generar `ios/` una vez, o se usa bootstrap en CI?
2. **¿Qué host HTTPS gratuito** para el backend (Render / Fly / túnel)?
3. **¿Se necesita push notifications** en la fase de pruebas? Si sí, requiere Apple Developer ($99) — fuera de este plan.
4. **¿Se adopta la PWA como canal principal** para usuarios sin sideload?

---

## 9. Implementado en esta rama (`feature/ios-deploy`)

- `@capacitor/ios` instalado y plataforma generada en `frontend/ios/`.
- `capacitor.config.ts` actualizado con bloque `ios.scheme = 'App'`.
- `frontend/ios/App/App/Info.plist` incluye excepción ATS (`NSAllowsArbitraryLoads`) para permitir HTTP al backend local en pruebas.
- Workflow `.github/workflows/ios.yml` (build unsigned + pod install + upload artifact).
- `.gitignore` excluye `Pods/`, `build/`, `DerivedData/`.

### Cómo probar ahora (HTTP, backend local)

1. Levantar el backend en la PC: `mvn spring-boot:run` (puerto 8080).
2. Obtener la IP local de la PC (ej. `192.168.1.50`).
3. En GitHub → Secrets → `BACKEND_URL` = `http://192.168.1.50:8080/api/v1`.
4. Disparar el workflow `iOS Build (unsigned)` (Actions → Run workflow).
5. Descargar `app-unsigned-ipa` y sideload con Sideloadly/AltStore usando una cuenta Apple gratuita.
6. En el iPhone: Ajustes → General → VPN y gestión de dispositivos → confiar en el desarrollador.

### Próximo sprint — despliegue de backend (HTTPS)

Cuando se despliegue el backend, remover la excepción ATS y pasar a HTTPS:

1. Eliminar el bloque `NSAppTransportSecurity` de `Info.plist`.
2. Cambiar `BACKEND_URL` al dominio HTTPS del backend desplegado.
3. Si se usa un PaaS (Render/Fly/Railway), el HTTPS viene incluido; no se necesita Certbot/CertKit.
4. Si se self-hostea en VPS, usar Certbot (Let's Encrypt) con un dominio propio.
5. Volver a disparar el workflow y reinstalar el IPA (la URL queda bakeada en el build).

### Cosas a tener en cuenta

- La URL del backend queda embebida en el build (`NEXT_PUBLIC_API_URL`); cada cambio de URL requiere rebuild.
- La firma gratuita expira a los 7 días: refrescar con AltServer/Sideloadly.
- Máximo 3 apps sideloaded por cuenta Apple gratuita.
- Push notifications (APNs) no funcionan sin Apple Developer Program ($99).
- El workflow consume minutos macOS (10x); dispararlo solo manualmente y cachear CocoaPods.
- No subir `Pods/` al repo; se regeneran en CI.

1. Aprobar este plan (o ajustar scope).
2. Ejecutar Fase I0 (PWA) para tener algo probable en iPhone esta semana.
3. Resolver la decisión 1 (Mac vs bootstrap CI) para desbloquear la Capa 1.
4. Crear la rama `feature/ios-deploy` y el workflow `ios.yml` cuando se apruebe.

---

## Referencias

- Plan móvil base: `docs/mobile-migration-plan.md` (sección 12)
- Capacitor iOS: https://capacitorjs.com/docs/ios
- Sideloadly: https://sideloadly.io
- AltStore: https://altstore.io
- ipa-builder (referencia de build unsigned en CI): https://github.com/adro0303/ipa-builder
- Apple ATS / HTTPS: https://developer.apple.com/documentation/security/preventing_insecure_network_connections
