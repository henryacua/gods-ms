<div align="center">
  <img src="https://nestjs.com/img/logo-small.svg" alt="NestJS Logo" width="120" />
  
  <h1>🛡️ GODS-MS (Microservice Core)</h1>
  <p><strong>Enterprise-grade Backend Template for Scalable Microservices</strong></p>

  <p>
    <img src="https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
    <img src="https://img.shields.io/badge/-GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white" alt="GraphQL" />
    <img src="https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white" alt="Postgres" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  </p>
</div>

---

## 🚀 Overview

`gods-ms` is a robust, production-ready backend boilerplate built on top of **NestJS**. Designed to be the source of truth for your microservices architecture, it seamlessly integrates a **GraphQL API** (Apollo), relational data modeling via **TypeORM**, and enterprise-grade security.

More than just a boilerplate, this repository comes pre-wired with architectural best practices and foundational business modules to accelerate your development process.

## ✨ Core Features & Included Modules

This template doesn't just give you an empty shell. It includes a baseline architecture ready to be expanded:

- 🔐 **Authentication Engine:** Fully configured JWT strategy, Bcrypt password hashing, and role-based access control.
- 📦 **User Management (`/src/modules/user`):** Pre-built entity, resolvers, repositories, and services for robust user management.
- 🗄️ **Database Abstraction:** TypeORM set up for PostgreSQL with migrations and environment-based configuration.
- 🛠️ **Developer Experience:** Husky pre-commit hooks, Jest testing environment, ESLint, and Prettier perfectly synced.

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | NestJS |
| **API Layer** | GraphQL + Apollo Server Express |
| **Database** | PostgreSQL + TypeORM |
| **Security** | JWT, Bcrypt, Class Validator |
| **Testing** | Jest, Supertest |

## 🕹️ Getting Started

### 1. Installation

```bash
# Clone and install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env` file at the root of the project with your database credentials and secret keys. Example configuration keys to include:
- `DATABASE_URL`
- `JWT_SECRET`

### 3. Running the Microservice

```bash
# development mode with hot-reload
npm run start:dev

# production mode
npm run start:prod
```

## 🏗️ Usage as a Template

When adopting this repository for a specific new microservice (e.g., *Payments*, *Notifications*):
1. **Rename the project:** Update the `name` field in `package.json`.
2. **Adapt the Modules:** Delete or repurpose the existing business folders (like `/src/modules/user`) to match your new microservice's domain model.
3. **Extend:** Add your new GraphQL schemas and entities. The architecture is ready to scale with you!
