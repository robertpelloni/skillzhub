# SkillzHub - Ideas & Improvements

## Technical Enhancements
- **Multi-region Storage:** Route uploads to the nearest S3 bucket to lower latency for international creators.

- **Edge Functions:** (Partially Completed) Implemented fail-open string validation for API keys inside Next.js Edge `middleware.ts` to block malformed requests before hitting the DB.

## Product Features
- **Creator Tiers:** Gamify the creator side with "Trust Tiers." High-trust creators bypass manual admin QC and go straight to dataset generation.
- **Bounty Boosts:** Allow companies to surge pricing dynamically for specific environments if they aren't getting enough submissions.
- **Synthetic Data Upsell:** Offer companies a one-click button in the UI to generate depth maps or segmentation masks for purchased datasets for an extra fee.
