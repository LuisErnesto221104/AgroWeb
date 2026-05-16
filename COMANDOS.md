# Comandos para correr AgroWeb

## 1. Entrar a la carpeta del proyecto

```bash
cd "C:\Users\ernes\Documents\University\8.-𝓢𝓮𝓶𝓮𝓼𝓽𝓻𝓮 8\Desarrollo de Aplicaciones Web Modernas\AgroWeb"
```

## 2. Instalar dependencias

```bash
npm install
```

## 3. Levantar el backend

Abrir una terminal y ejecutar:

```bash
npm run dev:api
```

La API queda en:

```text
http://localhost:4000
```

## 4. Levantar el frontend

Abrir otra terminal y ejecutar:

```bash
npm run dev
```

La app queda en:

```text
http://localhost:5173
```

## 5. Probar que la API responde

```bash
curl http://localhost:4000/api/health
```

## 6. Ver la base de datos mock

```bash
curl http://localhost:4000/api/db
```

## 7. Verificar el proyecto antes de entregar

```bash
npm run lint
npm run build
```

## 8. Reiniciar procesos Node si algo se queda atorado

En PowerShell:

```powershell
Get-Process node | Stop-Process
```

Luego volver a levantar:

```bash
npm run dev:api
```

Y en otra terminal:

```bash
npm run dev
```

## Credenciales iniciales

```text
Usuario: admin
PIN: 1234
```
