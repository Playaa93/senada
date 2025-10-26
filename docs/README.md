# Senada - Perfume Inventory Management System

A modern, type-safe perfume inventory management application built with Next.js 16, React 19, and TypeScript.

## Features

- **Next.js 16** with App Router and React Server Components
- **React 19.2** with the latest features
- **TypeScript** in strict mode for maximum type safety
- **Tailwind CSS v4** for modern styling
- **PWA Support** for offline capabilities
- **Turbopack** for blazing-fast development
- **React Compiler** for optimized performance
- **Shadcn/ui** component library integration
- **Cloudflare Workers** ready deployment structure

## Project Structure

```
Senada/
├── app/                          # Next.js App Router
│   ├── (dashboard)/              # Dashboard route group
│   │   ├── layout.tsx           # Dashboard layout
│   │   └── page.tsx             # Dashboard home page
│   ├── layout.tsx               # Root layout with PWA metadata
│   ├── page.tsx                 # Landing page (redirects to dashboard)
│   └── globals.css              # Global styles with Tailwind
│
├── components/                   # React components
│   ├── ui/                      # Shadcn UI components
│   │   └── button.tsx           # Button component
│   └── features/                # Business-specific components
│
├── lib/                         # Utility functions and helpers
│   └── utils.ts                 # Common utilities (cn, formatters, etc.)
│
├── workers/                     # Cloudflare Workers code
│
├── public/                      # Static assets
│   └── manifest.json            # PWA manifest
│
├── next.config.mjs              # Next.js configuration
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── postcss.config.mjs           # PostCSS configuration
├── .eslintrc.json               # ESLint configuration
├── .prettierrc.json             # Prettier configuration
├── .gitignore                   # Git ignore rules
├── .env.example                 # Environment variables template
└── package.json                 # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 20.0.0 or higher
- npm 10.0.0 or higher

### Installation

1. **Clone or navigate to the project directory**

```bash
cd C:\Users\hzuki\OneDrive\Bureau\Applications\Senada
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your configuration
```

4. **Run the development server**

```bash
npm run dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Next.js 16 Features Enabled

### Turbopack
Fast bundler enabled by default in development mode for improved performance.

### React Compiler
Automatic optimization of React components without manual memoization.

### Partial Prerendering (PPR)
Combines static and dynamic rendering for optimal performance.

### Dynamic IO
Enables streaming and progressive rendering for better UX.

## TypeScript Configuration

The project uses strict TypeScript configuration with:
- Strict mode enabled
- No unchecked indexed access
- Unused locals and parameters warnings
- Path aliases for clean imports:
  - `@/components/*`
  - `@/lib/*`
  - `@/app/*`
  - `@/workers/*`
  - `@/types/*`

## Styling with Tailwind CSS v4

The project includes:
- Custom color scheme with CSS variables
- Dark mode support
- Custom animations
- Responsive design utilities
- Component-based styling with CVA

## PWA Configuration

Progressive Web App features include:
- App manifest for installability
- Service worker support (add next-pwa for full implementation)
- Offline capabilities
- App shortcuts
- Platform-specific optimizations

## Component Library

Using shadcn/ui components:
- Pre-configured Button component in `components/ui/`
- Utility functions in `lib/utils.ts`
- Easy to add more components with `npx shadcn@latest add [component]`

## Deployment

### Cloudflare Pages/Workers

The project is configured for Cloudflare deployment with:
- Standalone output mode
- Workers directory for edge functions
- Environment variable support

```bash
# Build for production
npm run build

# Deploy to Cloudflare
# Configure wrangler.toml and use:
npx wrangler pages deploy
```

### Vercel

```bash
# Deploy to Vercel
vercel
```

## Environment Variables

See `.env.example` for all available environment variables:

- `NEXT_PUBLIC_APP_URL` - Application URL
- `DATABASE_URL` - Database connection string
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account ID
- And more...

## Database

The project structure supports various database options:
- Cloudflare D1 (recommended for Cloudflare deployment)
- PostgreSQL
- MySQL
- SQLite

Add your preferred database client in the `lib/` directory.

## Adding New Features

### Adding a new page

```bash
# Create a new route in app directory
mkdir app/products
touch app/products/page.tsx
```

### Adding a shadcn component

```bash
# Add a new UI component
npx shadcn@latest add [component-name]
```

### Adding a new API route

```bash
# Create API route
mkdir -p app/api/perfumes
touch app/api/perfumes/route.ts
```

## Code Quality

The project includes:
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety
- Automatic code formatting on save (configure in your editor)

## Best Practices

1. **Keep components small** - Under 500 lines
2. **Use TypeScript strictly** - No `any` types
3. **Write tests** - Add tests for critical functionality
4. **Environment safety** - Never commit secrets
5. **Documentation** - Document complex logic

## Performance Optimizations

- React Compiler for automatic optimization
- Image optimization with next/image
- Font optimization with next/font
- Code splitting with dynamic imports
- Edge runtime support

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

Private - All rights reserved

## Support

For issues and questions, please create an issue in the repository.

---

Built with Next.js 16, React 19, and TypeScript
