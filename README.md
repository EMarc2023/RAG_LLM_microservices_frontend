
[![Frontend CI](https://github.com/EMarc2023/RAG_LLM_microservices_frontend/actions/workflows/CI.yml/badge.svg)](https://github.com/EMarc2023/RAG_LLM_microservices_frontend/actions/workflows/CI.yml)


# 🤖 RAG Assistant
### Generative AI Chatbot with Local LLM Integration

A modern, high-performance Retrieval-Augmented Generation (RAG) interface built with **React**, **TypeScript**, and **Tailwind CSS v4**. This application is designed to interface with a local **TinyLlama 1.1B** model to provide intelligent, context-aware responses.

---

## ✨ Features

* **Modern UI/UX**: A clean, minimalist interface featuring a layered `#F3F3F3` background and floating content cards.
* **Micro-Interactions**: Hover scales, tactile button "squish" effects, and smooth transitions for a premium feel.
* **Interactive Chat**: Real-time response rendering with **Markdown support** (bolding, lists, and code blocks).
* **Source Transparency**: Displays specific document sources used by the AI to generate answers.
* **Utility Tools**: One-click conversation reset and chat history export (.txt).
* **Responsive Design**: Fully optimised for mobile, tablet, and desktop viewing.

---

## 🛠️ Tech Stack

* **Frontend**: React 18 + Vite
* **Language**: TypeScript
* **Styling**: Tailwind CSS v4 (with `@tailwindcss/postcss`)
* **Icons**: Lucide React
* **AI Engine**: TinyLlama 1.1B
* **Testing**: Vitest + React Testing Library

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/)

# Building and deploying the app

## Local build

```PowerShell
npm run build
```

Click the link on the terminal to access the frontend UI.

## Docker build

To build, run

```bash
docker build --no-cache -t rag-frontend-ui
```

To access the frontend UI, run
```bash
docker run -d -p 4173:4173 rag-frontend-ui
```
and then open ```http://localhost:4173``` on the web browser.

# Related repositories:
Backend: https://github.com/EMarc2023/RAG_LLM_microservices
Desktop client: https://github.com/EMarc2023/RAG_LLM_microservices_desktop 


