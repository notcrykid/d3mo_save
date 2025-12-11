# d3mo - E-commerce Platform

Modern e-commerce platform built with Nuxt.js 4, Vue 3, and TypeScript, featuring SSR/SSG capabilities for optimal performance and SEO.

## Quick Start

Follow these steps to get the project running locally:

> **⚠️ Important:** All commands below must be executed from the **`d3mo/`** directory (the project root).  
> Make sure you're in the correct directory before running any commands.

### Step 1: Install Prerequisites

Make sure you have the following installed on your system:

1. **Node.js** LTS (version 18.x or 20.x)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **pnpm** (package manager)
   - Install globally: `npm install -g pnpm`
   - Verify installation: `pnpm --version`

### Step 2: Clone and Setup

If you're setting up the project for the first time:

```bash
# 1. Navigate to the project directory (if not already there)
cd d3mo

# Verify you're in the correct directory (should show: d3mo)
pwd

# 2. Install all dependencies (from d3mo/ directory)
pnpm install

# 3. Create environment file from template (from d3mo/ directory)
cp .env.example .env

# 4. Edit .env file with your values (optional for local dev)
# Open .env and set:
# NUXT_PUBLIC_APP_URL=http://localhost:3000
# NUXT_PUBLIC_APP_NAME=d3mo
```

**Working Directory:** All commands above must be run from `d3mo/` (project root)

### Step 3: Start Development Server

**Make sure you're in the `d3mo/` directory**, then run:

```bash
# From d3mo/ directory
pnpm run dev
```

The application will be available at: **http://localhost:3000**

**Working Directory:** Command must be executed from `d3mo/` (project root)

That's it! The project should now be running. See sections below for more details.

---

## Detailed Setup Instructions

### Prerequisites

Before getting started, ensure you have the following installed:

- **Node.js** LTS (18.x or 20.x) - [Download](https://nodejs.org/)
- **pnpm** (latest) - Package manager. Install globally with:
  ```bash
  npm install -g pnpm
  ```

### Initial Setup (First Time)

This project uses Nuxt.js 4.2.1 (the latest stable version, fully compatible with Nuxt 3 requirements).

**For a fresh clone of this repository, execute these commands in order:**

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure environment variables:**
   ```bash
   # From d3mo/ directory - Copy the template file
   cp .env.example .env
   
   # Edit .env file (use your preferred text editor)
   # At minimum, set these values:
   # NUXT_PUBLIC_APP_URL=http://localhost:3000
   # NUXT_PUBLIC_APP_NAME=d3mo
   ```

3. **Verify setup:**
   ```bash
   # From d3mo/ directory - This should start the dev server successfully
   pnpm run dev
   ```

## Project Structure

The project follows Nuxt.js conventions with file-based routing:

```
d3mo/
├── components/          # Vue components (reusable UI elements)
├── pages/              # File-based routing (each file becomes a route)
├── layouts/            # Nuxt layouts (page wrappers)
├── composables/        # Vue composables (reusable logic)
├── utils/              # Utility functions
├── app/                # Application entry point
├── public/             # Static files (served as-is)
├── assets/             # Static assets (processed by Vite)
├── .nuxt/              # Nuxt build output (auto-generated, gitignored)
├── .output/             # Production build output (gitignored)
├── .env                 # Environment variables (gitignored)
├── .env.example         # Environment variables template
├── nuxt.config.ts       # Nuxt configuration
├── package.json         # Project dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## Environment Variables

The project uses environment variables for configuration. The `.env` file must be created before running the application.

### Setup Environment File

**Working Directory:** Run these commands from **`d3mo/`** directory.

1. **Copy the template:**
   ```bash
   # From d3mo/ directory
   cp .env.example .env
   ```

2. **Edit `.env` file** with your text editor and set the following values:

### Required Variables (Set These)

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `NUXT_PUBLIC_APP_URL` | Public URL of your application | `http://localhost:3000` (for dev) |
| `NUXT_PUBLIC_APP_NAME` | Name of your application | `d3mo` |

**Example `.env` file for local development:**
```env
NUXT_PUBLIC_APP_URL=http://localhost:3000
NUXT_PUBLIC_APP_NAME=d3mo
```

### Optional Variables (Future Integrations)

These variables are prepared for future integrations. You can leave them empty for now:

- `MEDUSA_BACKEND_URL` - Backend API URL (Epic 4+)
- `STRAPI_URL` - CMS API URL (Epic 4+)
- `STRIPE_PUBLIC_KEY` - Stripe public key for payments (Epic 7+)

**Important:** 
- Never commit your `.env` file to version control
- Only `.env.example` is tracked in Git
- The `.env` file is automatically ignored by Git

## Development Server

### Start the Server

**Working Directory:** All commands in this section must be run from the **`d3mo/`** directory (project root).

Run this command:

```bash
# From d3mo/ directory
pnpm run dev
```

> 💡 **Tip:** Verify you're in the correct directory with `pwd`. You should see a path ending with `d3mo`.

### What to Expect

1. The command will start the Nuxt development server
2. Wait for the compilation to complete (you'll see "Local: http://localhost:3000")
3. Open your browser and navigate to: **http://localhost:3000**
4. You should see the application running

### Features Included

- **Hot Module Replacement (HMR)** - Code changes are reflected instantly without page refresh
- **TypeScript type checking** - Type errors are shown in the terminal
- **ESLint code quality checks** - Code quality issues are reported
- **Vue DevTools support** - Use Vue DevTools browser extension for debugging

### Stopping the Server

Press `Ctrl + C` in the terminal to stop the development server.

## Build Process

### Building for Production

**Working Directory:** All build commands must be executed from the **`d3mo/`** directory (project root).

To build the application for production deployment:

```bash
# From d3mo/ directory
pnpm run build
```

> 💡 **Tip:** Verify you're in the correct directory with `pwd` before running build commands.

### What Happens During Build

1. **TypeScript Compilation** - All `.ts` and `.vue` files are compiled to JavaScript
2. **ESLint Checks** - Code quality is validated (build fails if errors are found)
3. **Asset Bundling** - All assets are optimized and bundled
4. **Output Generation** - Production-ready files are generated in `.output/` directory

### Build Validation

The build will **fail** if any of these occur:
- ❌ TypeScript compilation errors
- ❌ ESLint code quality errors
- ❌ Missing or unresolved dependencies

If the build succeeds, you'll see:
- ✅ Build output in `.output/` directory
- ✅ Success message in terminal

### Preview Production Build

**Working Directory:** All commands must be run from **`d3mo/`** directory.

To test the production build locally **before deploying**:

```bash
# From d3mo/ directory

# 1. First, build the application
pnpm run build

# 2. Then preview the production build
pnpm run preview
```

This will:
- Serve the built application from `.output/` directory
- Simulate production behavior
- Allow you to test at: **http://localhost:4173** (default port)

## Code Quality

The project uses automated code quality tools to maintain consistency:

### Tools Used

- **ESLint** - Code linting with Vue 3 and TypeScript rules (flat config format)
- **Prettier** - Automatic code formatting for consistency
- **TypeScript** - Type safety with strict mode enabled

### How It Works

1. **During Development:** ESLint and TypeScript checks run automatically in the dev server
2. **During Build:** All code quality checks must pass or the build will fail
3. **Before Committing:** Ensure all checks pass to avoid build failures

### Manual Checks (Optional)

**Working Directory:** Run these commands from **`d3mo/`** directory.

You can run linting manually:

```bash
# From d3mo/ directory

# Run ESLint checks
pnpm exec eslint .

# Format code with Prettier (if configured)
pnpm exec prettier --write .
```

**Note:** Code quality checks are automatically integrated into the build process, so manual checks are usually not necessary.

## Technical Decisions

### Nuxt 4.2.1 vs Nuxt 3

This project uses **Nuxt 4.2.1** (the latest stable version) instead of Nuxt 3. Nuxt 4 is fully backward compatible with Nuxt 3 and includes all required features:

- SSR/SSG capabilities
- Vue 3 support
- TypeScript integration
- File-based routing

This decision ensures we're using the most up-to-date, stable version while maintaining full compatibility with all requirements.

### ESLint Flat Config

The project uses ESLint 9 with the modern flat config format (`eslint.config.js`) instead of the legacy `.eslintrc` format. This is the recommended approach for ESLint 9+ and provides better performance and configuration clarity.

## Additional Resources

- [Nuxt.js Documentation](https://nuxt.com/docs)
- [Vue 3 Documentation](https://vuejs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [pnpm Documentation](https://pnpm.io/)

## Deployment

For deployment instructions, see the [Deployment Guide](../docs/deployment.md).

The application is deployed to **Vercel** using **GitHub Actions** CI/CD pipeline. Pushing to the `main` branch automatically triggers deployment.

**Quick Links:**
- [Deployment Guide](../docs/deployment.md) - Complete deployment documentation
- [Vercel Dashboard](https://vercel.com/dashboard) - Manage deployments
- [GitHub Actions](../../actions) - View CI/CD workflow runs

## Getting Help

For project-specific questions or issues, refer to:

- Project documentation in `docs/` directory
- [Deployment Guide](../docs/deployment.md) - Deployment instructions
- Story context files in `docs/stories/`
- Architecture documentation in `docs/architecture.md`
