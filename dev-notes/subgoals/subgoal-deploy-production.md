# subgoal-deploy-production.md

Derived from master GOAL.md / acceptance criterion: "Deploy to production."

## Problem
The project passes all quality gates but hasn't been deployed to production yet.

## Goal
Deploy the application to a production platform (Vercel, since `vercel.json` already exists).

## Verification Gates
- [ ] Deploy to Vercel succeeds
- [ ] Production URL responds with 200
- [ ] All pages load correctly
- [ ] Environment variables configured (NEXTAUTH_SECRET, etc.)

## Files to Touch
- None (deployment is platform action)
- Possibly `.env.production` for production env vars

## Non-Goals
- Database setup (app uses localStorage only)
- Custom domain configuration

## Status
pending
