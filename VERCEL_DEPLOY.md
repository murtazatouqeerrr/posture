# Vercel Deployment Guide

## Quick Deploy

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy to Vercel:
```bash
vercel --prod
```

## Configuration

The project is now configured for Vercel with:

- **API Routes**: All API endpoints are handled by `/api/index.js`
- **Static Files**: Public files served from `/public/` directory
- **SPA Routing**: All non-API routes redirect to `index.html`
- **Formatted Revenue**: Revenue figures are automatically formatted (12.5K, 1.2M, etc.)

## Key Changes Made

1. **Created `/api/index.js`** - Vercel-compatible serverless function
2. **Updated `vercel.json`** - Proper routing configuration
3. **Mock Data** - Uses in-memory data instead of SQLite for serverless compatibility
4. **Revenue Formatting** - Added helper function to format large numbers
5. **Updated Charts** - Better tooltip formatting for revenue display

## Features

- ✅ Patient/Contact Management
- ✅ Appointment Scheduling  
- ✅ Invoice Tracking
- ✅ Reports with Formatted Revenue
- ✅ Treatment Plans
- ✅ Responsive Design

## Environment Variables

No environment variables required for basic deployment. The app uses mock data by default.

## Troubleshooting

If you encounter 404 errors:
1. Ensure `api/index.js` exists
2. Check `vercel.json` routing configuration
3. Verify all static files are in `/public/` directory

## Local Development

```bash
npm run dev
```

This will start the original server with SQLite database for local development.
