# Package Tracker

A modern package tracking application built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 📦 Track packages from multiple carriers
- 🎨 Modern, responsive UI with Tailwind CSS
- 🌙 Dark mode support with next-themes
- 📱 Mobile-friendly design
- ⚡ Fast performance with Next.js
- 🔍 Search and filter functionality
- 📊 Package analytics and insights

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) 15.2.4
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) 4.1.9
- **UI Components:** [Radix UI](https://www.radix-ui.com/)
- **Forms:** [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) validation
- **Icons:** [Lucide React](https://lucide.dev/)
- **Charts:** [Recharts](https://recharts.org/)
- **Animations:** [Tailwind CSS Animate](https://github.com/jamiebuilds/tailwindcss-animate)

## Getting Started

### Prerequisites

Make sure you have Node.js installed on your machine. This project requires Node.js 16 or later.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/shakib75bd/Package-Tracker.git
   cd package-tracker
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check for code quality issues

## Project Structure

```
package-tracker/
├── app/                    # App Router directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── loading.tsx        # Loading UI
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── ui/               # UI component library
│   ├── chatbot.tsx       # Chatbot component
│   ├── package-details.tsx
│   ├── theme-provider.tsx
│   └── user-profile.tsx
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and services
│   ├── package-service.ts
│   └── utils.ts
├── public/               # Static assets
└── styles/               # Additional styles
```

## Configuration

### Environment Variables

Create a `.env.local` file in the root directory and add your environment variables:

```env
# Add your environment variables here
NEXT_PUBLIC_API_URL=your_api_url
```

### Tailwind CSS

The project uses Tailwind CSS for styling. Configuration can be found in `tailwind.config.js`.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or need help with the project, please open an issue on GitHub.

## Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) for the accessible UI components
- [Lucide](https://lucide.dev/) for the beautiful icons
