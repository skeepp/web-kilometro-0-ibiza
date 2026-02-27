@echo off
chcp 65001 >nul
title De la Finca — Device Lab
color 0A

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║   🌿 DE LA FINCA — Device Lab Launcher  ║
echo  ╚══════════════════════════════════════════╝
echo.

cd /d "%~dp0"

:: Verificar si node_modules existe
if not exist "node_modules\" (
    echo  ⏳ Primera vez: instalando dependencias...
    echo  Esto puede tardar 1-2 minutos.
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo  ❌ Error instalando dependencias.
        echo  Asegúrate de tener Node.js instalado: https://nodejs.org
        pause
        exit /b 1
    )
    echo.
    echo  ✅ Dependencias instaladas correctamente.
    echo.
)

:: Crear .env.local si no existe
if not exist ".env.local" (
    echo  ⚠️  No se encontró .env.local
    echo  Creando archivo de ejemplo...
    (
        echo # Supabase
        echo NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
        echo NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
        echo.
        echo # Stripe
        echo STRIPE_SECRET_KEY=sk_test_XXXX
        echo NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_XXXX
        echo.
        echo # Cloudinary
        echo NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=tu-preset
        echo.
        echo # Resend
        echo RESEND_API_KEY=re_XXXX
    ) > .env.local
    echo.
    echo  📝 Archivo .env.local creado con valores de ejemplo.
    echo  ⚠️  EDÍTALO con tus claves reales antes de continuar.
    echo.
    notepad .env.local
    pause
)

echo  🚀 Lanzando servidor de desarrollo...
echo  La web estará en: http://localhost:3000
echo.
echo  ⏳ Espera unos segundos a que compile...
echo  Mientras tanto, se abrirá el Device Lab en tu navegador.
echo.

:: Abrir el preview.html en 5 segundos (dar tiempo al server)
start "" cmd /c "timeout /t 5 /nobreak >nul && start "" "%~dp0preview.html""

:: Lanzar el servidor (esto bloquea la terminal)
call npm run dev

pause
