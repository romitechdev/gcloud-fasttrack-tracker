# GCLoud Fasttrack Tracker

A robust, multi-user web application to automatically track, manage, and monitor completion progress of Google Cloud Skills Boost "Fasttrack" labs.

## Features

- **Multi-user Support**: Log in using your Google Cloud Skills Boost Public Profile URL.
- **Auto-Sync**: Automatically fetches and scrapes completion data directly from your public profile to restore progress.
- **Error Tracking**: Conveniently mark any lab as 'Error' to highlight issues, with easy toggling.
- **Persistent Deployment**: Runs 24/7 in a Docker container using a systemd service.

## Tech Stack

- **Next.js 16** (App Router)
- **SQLite** & **Prisma ORM**
- **Tailwind CSS** & **Shadcn UI**
- **Docker** & **Docker Compose**
- **Cloudflare Tunnel**

## Getting Started

### Prerequisites

- Node.js 22+
- Docker & Docker Compose
- Cloudflare `cloudflared` (if hosting with tunnel)

### Installation

1. Clone the repository and install dependencies:
   ```bash
   git clone <repo-url>
   cd gcloud-fasttrack-tracker
   npm install
   ```

2. Setup environment variables:
   ```bash
   cp .env.example .env
   ```

3. Initialize database:
   ```bash
   npx prisma db push
   ```

### Docker Deployment

Run the application as a container:
```bash
docker compose up -d --build
```

The application will be accessible on port `3000`.

<!-- last-updated -->
_Last updated: 2026-09-05_

