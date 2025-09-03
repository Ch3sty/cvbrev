# Deployment Trigger

This file exists to trigger Vercel deployments.

Last updated: 2025-01-09 - Force deployment of 405 fix

The main issue is that `/api/letters/download` route is returning 405 Method Not Allowed on production despite having the correct `await cookies()` fix locally.

## Changes made:
- Added `await cookies()` fix in route.ts
- Added debug GET endpoint 
- Added vercel.json for function configuration
- Updated package.json version to trigger rebuild

## Expected result:
- GET /api/letters/download should return debug info
- POST /api/letters/download should process requests (or return 401 if not authenticated)