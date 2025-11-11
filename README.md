# MoodLog Frontend

A modern React + Vite + TypeScript frontend for MoodLog, an AI-powered personal journal application.

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Mantine** - UI component library
- **React Router** - Routing
- **Zod** - Schema validation
- **Tabler Icons** - Icon library

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build

Build for production:

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
moodlog-frontend/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── AuthLayout.tsx      # Shared auth layout
│   │   │   └── GoogleButton.tsx    # Google OAuth button
│   │   └── LandingPage.tsx         # Landing page
│   ├── pages/
│   │   ├── LoginPage.tsx           # Login page
│   │   └── RegisterPage.tsx       # Register page
│   ├── types/
│   │   └── auth.ts                 # Auth type definitions
│   ├── utils/
│   │   └── validation.ts          # Zod validation schemas
│   ├── App.tsx                     # Root component with routing
│   ├── main.tsx                    # Entry point
│   └── index.css                   # Global styles
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Features

- ✅ Modern, responsive landing page
- ✅ Login page with email/password
- ✅ Register page with password validation
- ✅ Google OAuth button (UI ready)
- ✅ Form validation with Zod
- ✅ Type-safe with TypeScript
- ✅ Production-ready code structure
- ✅ Minimalist black & white design
- ✅ Smooth animations

## Routes

- `/` - Landing page
- `/login` - Login page
- `/register` - Register page
- `/dashboard` - Dashboard (placeholder)

## Code Quality

- **Type Safety**: Full TypeScript coverage
- **Validation**: Zod schemas for form validation
- **Error Handling**: Proper error states and messages
- **Accessibility**: Semantic HTML and ARIA labels
- **Performance**: Optimized animations and transitions
- **Best Practices**: Clean code structure, separation of concerns

## Next Steps

1. Connect to backend API for authentication
2. Implement Google OAuth integration
3. Add password reset functionality
4. Create dashboard page
5. Add protected routes
