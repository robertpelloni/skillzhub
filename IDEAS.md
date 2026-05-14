# SkillzHub - Ideas & Improvements

## Technical Enhancements
- **Multi-region Storage:** Route uploads to the nearest S3 bucket to lower latency for international creators.

- **Edge Functions:** (Partially Completed) Implemented fail-open string validation for API keys inside Next.js Edge `middleware.ts` to block malformed requests before hitting the DB.

## Product Features
- **Creator Tiers:** Gamify the creator side with "Trust Tiers." High-trust creators bypass manual admin QC and go straight to dataset generation.
