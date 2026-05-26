# Group Ordering Coding Assignment

For this coding assignment, I created a Seafood Shack group ordering application that satisfies all requested requirements while also adding a few additional features. Hosts can track invited participants and monitor their current order status throughout the ordering flow.

## Getting Started

There are two ways to use the application:

### Deployed:

Click on this [link](https://group-ordering.vercel.app/) to access the deployed app.

No environment variables are required for the hosted version.

Please note: Group order invite emails will come from notifications@cosmikata.com.

or

### Local:

After cloning the repository and running:

```bash
pnpm install
```

Create a `.env` file and follow the values provided in `.env.example`. Some of the values you will need to create or modify.

Then run the development server:

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Access

You should have received credentials for the Neon database instance. Feel free to add or remove data as needed during review.

This temporary account will be removed after the review period.

## Tech Stack

Frontend:

- Next.js
- React
- TanStack Form

Backend:

- Node.js BFF
- Better Auth
- Resend
- React Email

Database:

- PostgreSQL (Neon)
- Drizzle ORM

Styling:

- Tailwind
- Shadcn/ui

Tooling & Validation:

- Vitest
- Testing Library
- Zod

## Architecture / Design Decisions

### Folder Structure

I used a feature-oriented structure while aligning with common Next.js conventions. My goal was to keep related business logic, UI components, and server functionality grouped together to improve maintainability and scalability.

### Database

I chose PostgreSQL and Neon because it provides a reliable relational database with a strong serverless developer experience.

Because of Drizzle's fast perfomance and strong TypeScript support I chose it for this application.

### Authentication

Better Auth was used to simplify the anonymous experience through authentication that could lead to an easy sign up experience.

### Vercel

Using Vercel to deploy the application makes it easier for others to test the project without needing to go through additional local setup steps if they’re short on time.

## Using AI

I used AI during this coding assignment to quickly help build out a prototype so I could validate that I was moving in the right direction early in development.

While using AI, I relied on my engineering knowledge and experience to guide the overall architecture, implementation, and decision-making process. I manually adjusted the code where needed while using AI for tasks like unit tests, repetitive code, and accelerating development workflows.

## If I Had More Time

- Refactor more files into smaller, more focused modules.
- Adding WebSocket support so the host can receive real-time cart updates.
- Create additional logic handling for more edge cases and failure scenarios.
- Add loading states like skeleton loading.
- Small but clean up the import order with ESLint.
