# Package Tracker

## Project Title and Summary

A modern, full-stack parcel tracking web application that allows users to track packages from all major carriers, view live status updates, and manage deliveries. Built with Next.js, React, GraphQL, and Clerk authentication, it features a clean UI, chatbot assistant, and advanced package details visualization.

## Key Features

- Track packages from multiple carriers
- Live status updates and timeline visualization
- Google Maps preview for delivery location
- Chatbot assistant for queries and tracking
- User authentication and profile management
- Full-screen package details overlay
- Responsive, modern UI

## Technologies Used

- Next.js (App Router)
- React
- GraphQL (custom backend)
- Clerk (authentication)
- Tailwind CSS
- Lucide Icons
- Node.js

## How to Run (Local Setup Instructions)

1. Clone the repository:
   ```bash
   git clone https://github.com/shakib75bd/Package-Tracker.git
   cd Package-Tracker
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start the development server:
   ```bash
   pnpm dev
   ```
4. Ensure the GraphQL backend is running at `http://localhost:8000/graphql`.
5. Access the app at `http://localhost:3000`.

## API Overview (Sample Endpoints)

- `POST /graphql` (main endpoint)
  - `getPackageByTrackingNumber(trackingNumber: String!)`: Fetch package details
  - `getPackages`: List all packages for a user

## Security Features Implemented

- Clerk authentication for user sign-in/sign-out
- Protected profile and package details routes
- Input validation for tracking numbers
- Secure API calls with Bearer tokens

## Analytics Setup

- (Example) Google Analytics or Vercel Analytics can be integrated
- Tracks page views, user interactions, and package search events
- No sensitive data is tracked

## Roles of Group Members

- Labu: Full-stack development, backend API, authentication
- Shakib: UI/UX design, chatbot, frontend logic, documentation
- Shafiq: Chatbot integration, backend integration, UI/UX tweaks

---

For more details, see the source code and comments in each component. Contributions and feedback are welcome!
