# PWA con proxy y sesiones compartidas

Demo de una PWA servida por un proxy frontal que distribuye las solicitudes de la API entre tres nodos Express. Redis guarda las sesiones para que el mismo ID de sesión y sus datos se conserven al cambiar de nodo.

## Inicio rápido (recomendado: Docker)

**Requisitos:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) en ejecución y Git. No necesitas Node ni Redis.

1. Clona el repositorio y entra a la carpeta:

   ```bash
   git clone <url-del-repositorio>
   cd Proyecto-Final
   ```

2. Crea tu archivo de configuración:

   ```powershell
   # Windows (PowerShell)
   Copy-Item .env.example .env
   ```

   ```bash
   # Mac / Linux
   cp .env.example .env
   ```

3. Abre `.env` y cambia `SESSION_SECRET` por un texto largo y aleatorio. Solo esta variable se usa con Docker; las demás ya están definidas en `docker-compose.yml`.

4. Levanta todo (Redis, tres nodos, proxy y nginx):

   ```bash
   docker compose up --build
   ```

5. Abre [http://localhost:8080](http://localhost:8080).

Para detener y borrar los contenedores: `Ctrl+C` y luego `docker compose down`.

## Uso de la demo

1. Inicia sesión con las credenciales de demostración `admin` / `1234`.
2. Usa **Probar siguiente nodo** para enviar solicitudes sucesivas a los tres nodos.
3. Comprueba que cambia el nombre/puerto del nodo, pero se mantiene el ID de sesión y aumenta el contador de visitas.
4. Usa **Cerrar sesión** para destruir la sesión actual.
5. Si el navegador ofrece la opción, instala la PWA desde el menú de instalación.

Las credenciales `admin` / `1234` están definidas directamente en `server/index.js` solo para esta demostración. No deben usarse en producción.

## Ejecución local sin Docker (opcional)

**Requisitos:** Node.js y npm, y un Redis accesible (puede ser un contenedor).

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Crea `.env` como en el inicio rápido y edita `SESSION_SECRET`. Los tres nodos deben usar el mismo secreto y el mismo Redis.

3. Inicia Redis si no lo tienes:

   ```bash
   docker run --name pwa-redis -p 6379:6379 -d redis
   ```

   Si el contenedor ya existe: `docker start pwa-redis`.

4. Inicia los tres nodos y el proxy:

   ```bash
   npm start
   ```

5. Abre [http://localhost:3000](http://localhost:3000). Mantén la terminal abierta y cierra con `Ctrl+C`.

> No ejecutes `npm start` y `docker compose up` al mismo tiempo: pueden chocar en los puertos.

## Configuración (variables de `.env`)

| Variable                                   | Valor predeterminado       | Descripción                                                 |
| ------------------------------------------ | -------------------------- | ----------------------------------------------------------- |
| `SESSION_SECRET`                           | No tiene; es obligatorio   | Firma las cookies de sesión en todos los nodos.             |
| `REDIS_URL`                                | `redis://localhost:6379`   | Redis compartido (solo modo local).                         |
| `FRONTAL_PORT`                             | `3000`                     | Puerto del proxy y de la PWA (modo local).                  |
| `NODE_1_URL` / `NODE_2_URL` / `NODE_3_URL` | No tienen                  | URLs de los tres nodos (modo local).                        |
| `PORT`                                     | `3001`                     | Puerto del nodo; los scripts fijan `3001`, `3002` y `3003`. |
| `NODE_NAME`                                | Nombre basado en el puerto | Nombre mostrado para el nodo.                               |

No subas `.env` al repositorio.

## Solución de problemas

- **`EADDRINUSE` o "port is already allocated"**: otro proceso usa el puerto. Cierra la ejecución anterior (`Ctrl+C`, `docker compose down`) o cambia el puerto.
- **`SESSION_SECRET` vacío o "Falta SESSION_SECRET"**: revisa que `.env` exista, no esté vacío y tenga esa variable.
- **Error de conexión a Redis (modo local)**: confirma que Redis está activo y que `REDIS_URL` es correcta.
- **El ID de sesión cambia entre nodos**: verifica que todos usan el mismo `SESSION_SECRET` y el mismo Redis, y que el navegador envía la cookie `pwa_cluster_sid`. Limpiar cookies inicia una sesión nueva.
- **La PWA muestra una versión vieja**: recarga con `Ctrl+Shift+R` o borra los datos del sitio.
- **Docker falla al construir con un error de `buildx ... being used by another process`**: ejecuta `docker compose build node1` y después `docker compose up`.
