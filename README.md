# Sistemas de recomendación - Modelos basados en el contenido

## Autores

| 👤 **Nombre** | 📧 **Correo Institucional** |
|---------------|-----------------------------|
| **Luis Chinea Rangel** | [alu0101118116@ull.edu.es](mailto:alu0101118116@ull.edu.es) |
| **Marlon Eduardo Salazar Amador** | [alu0101433943@ull.edu.es](mailto:alu0101433943@ull.edu.es) |
| **Adrián León Díaz** | [alu0101495668@ull.edu.es](mailto:alu0101495668@ull.edu.es) |

---

## **Tabla de Contenidos**

1. [Introducción](#1-introducción)
2. [Objetivos](#2-objetivos)
3. [Requisitos y entorno de desarrollo](#3-requisitos-y-entorno-de-desarrollo)
4. [Instalación y configuración](#4-instalación-y-configuración)
5. [Despliegue y ejecución](#5-despliegue-y-ejecución)
6. [Estructura general del proyecto](#6-estructura-general-del-proyecto)
7. [Conclusiones](#7-conclusiones)
8. [Referencias](#8-referencias)

---

## **1. Introducción**

El presente trabajo tiene como objetivo el desarrollo de un **sistema de recomendación basado en el contenido**, en el marco de la asignatura *Gestión del Conocimiento en las Organizaciones* del Grado de Ingeniería Informática de la Universidad de La Laguna.

Los sistemas de recomendación son herramientas utilizadas para predecir las preferencias de los usuarios a partir de información disponible. En este caso, el enfoque está centrado en el **análisis del contenido de los documentos**, aplicando métricas de representación textual que permiten medir su similitud.

---

## **2. Objetivos**

El objetivo principal de esta práctica es **implementar un sistema de recomendación siguiendo el modelo basado en el contenido**.

De manera específica, se pretende:

- Estudiar los modelos teóricos de recomendación basados en el contenido.
- Desarrollar una aplicación que procese documentos de texto plano.
- Aplicar técnicas de análisis de texto como la eliminación de palabras de parada y la lematización (implementadas en TypeScript/Node).
- Calcular las medidas TF, IDF y TF-IDF.
- Determinar la **similaridad del coseno** entre los documentos procesados.

---

## **3. Requisitos y entorno de desarrollo**

Este proyecto se ejecuta con Node.js y Angular; no requiere Python.

Requisitos mínimos:
- Node.js (v18+ recomendado). Verificar: `node --version`
- npm (incluido con Node.js). Verificar: `npm --version`
- Angular CLI (opcional, para desarrollo local): `npm install -g @angular/cli`
- Navegador web moderno.

Entorno de desarrollo sugerido:
- Ubuntu 24.04 (dev container proporcionado).
- Visual Studio Code.

---

## **4. Instalación y configuración**

Pasos para poner el proyecto en marcha (sin Python):

1. Clonar el repositorio y situarse en la raíz del proyecto:
   ```bash
   git clone <repo-url>
   cd sistemas_recomendacion_basado_contenido
   ```

2. Instalar dependencias del frontend:
   ```bash
   cd frontend
   npm install
   ```

3. Instalar dependencias del backend (servicios y procesamiento en Node/TypeScript):
   ```bash
   cd ../backend
   npm install
   ```

4. Colocar documentos de entrada:
   - Frontend de ejemplo: `frontend/src/assets/docs/`
   - Backend / datos procesados: `backend/data/` (crear si no existe)
   - Formato: archivos de texto plano (.txt). Ajustar ruta en la configuración si procede.

5. Configuración de entornos:
   - Frontend: editar `frontend/src/environments/environment.ts` si se requiere cambiar endpoints.
   - Backend: revisar variables en `backend/package.json` o `backend/.env` si existe.

Notas:
- Todo el preprocesado (stopwords, lematización, TF/IDF) está implementado en TypeScript dentro del backend/servicios del frontend. No se utiliza Python.

---

## **5. Despliegue y ejecución**

Ejecución en desarrollo (frontend + backend):

1. Iniciar backend (desde /backend):
   ```bash
   cd backend
   # intentar comando de desarrollo
   npm run dev || npm start || node dist/app.js
   ```
   - Si el proyecto usa ts-node/nodemon, `npm run dev` lanzará el servidor en modo desarrollo.

2. Iniciar frontend (desde /frontend):
   ```bash
   cd frontend
   npm start
   # o
   ng serve --open
   ```
   - Abrir en el navegador: `"$BROWSER" http://localhost:4200`

Construcción para producción:

1. Frontend:
   ```bash
   cd frontend
   npm run build -- --configuration production
   ```
   - Los artefactos quedan en `frontend/dist/`.

2. Backend: compilar/transpilar (si aplica) y ejecutar la versión producida:
   ```bash
   cd backend
   npm run build
   npm start
   ```

Despliegue con Docker (opcional):
- Crear Dockerfiles en `frontend/` y `backend/`, construir y desplegar contenedores. Ejemplo:
  ```bash
  docker build -t recomendador-frontend ./frontend
  docker build -t recomendador-backend ./backend
  docker run -d -p 4200:80 recomendador-frontend
  docker run -d -p 3000:3000 recomendador-backend
  ```

Logs y depuración:
- Revisar la terminal donde se ejecutan los procesos y la consola del navegador para errores.

---

## **6. Estructura general del proyecto**

Estructura principal (resumen):

- README.md
- frontend/
  - package.json
  - angular.json
  - src/
    - assets/docs/         # Documentos de prueba (.txt)
    - app/
      - services/
        - sistema-recomendacion.service.ts
      - app.component.ts
- backend/
  - package.json
  - src/
    - app.ts
    - utils/
      - procesamientoTexto.ts   # preprocesado: stopwords, lematización en TS
      - tfidf.ts                # TF, IDF, TF-IDF en TS
  - data/                       # datos procesados / índices
- scripts/ (opcional)            # utilidades en Node/TS si existen
- dist/                          # builds de producción

Descripción:
- Frontend (Angular) gestiona la UI y llamadas al backend.
- Backend (Node + TypeScript) realiza el procesamiento textual y proporciona APIs para obtener similitudes y recomendaciones.
- Los módulos de procesamiento (backend/src/utils) contienen la lógica de TF-IDF y similitud del coseno.

---

## **7. Conclusiones**

El proyecto ofrece una implementación completa de un sistema de recomendación basado en contenido usando únicamente tecnologías JavaScript/TypeScript y Angular. El enfoque facilita mantener todo el pipeline en Node/TS sin depender de Python. Es sencillo escalar el sistema para usar representaciones más avanzadas (embeddings) en el futuro.

Recomendaciones:
- Añadir tests unitarios para funciones TF/IDF y similitud.
- Incluir ejemplos de conjuntos de documentos y métricas de evaluación.
- Automatizar build y despliegue con Docker/CI.

---

## **8. Referencias**

- Manning, C. D., Raghavan, P., & Schütze, H. (2008). Introduction to Information Retrieval.
- Jurafsky, D., & Martin, J. H. — Speech and Language Processing.
- Scikit-learn: documentación TF-IDF y métricas — https://scikit-learn.org/ (referencia teórica)
- Angular: https://angular.io/
- Recursos sobre similitud del coseno y sistemas de recomendación basados en contenido.
