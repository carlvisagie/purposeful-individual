# Purposeful Live Coaching - Individual Site Deployment

## Quick Deploy to Manus

1. Go to https://manus.im/deployments
2. Click "New Deployment"
3. Select GitHub repository: `carlvisagie/purposeful-individual`
4. Branch: `main`
5. Build command: `pnpm install && pnpm run build`
6. Start command: `pnpm run start`
7. Environment variables:
   - `STRIPE_SECRET_KEY`: (your Stripe secret key)
   - `STRIPE_PUBLISHABLE_KEY`: (your Stripe publishable key)
   - `OPENAI_API_KEY`: (your OpenAI API key)
   - `DATABASE_URL`: (your MySQL database URL)
   - `SESSION_SECRET`: (generate a random secret)

## What This Site Is

Individual coaching platform (B2C) - landing page for consumers seeking personal coaching.

Different from the Enterprise site which targets B2B organizations.
