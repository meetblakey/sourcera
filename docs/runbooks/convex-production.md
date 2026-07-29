# Convex and Vercel production release

This path is retained as a stable pointer only.

Production behavior is governed by Master Spec §46.3.1. Planning, approval, and operational state live in the current native Linear Decision and its native relations. Do not copy that issue’s identifier, status, labels, or dependencies here.

The checked-in `.github/workflows/production-release.yml` workflow is evidence-only and fail-closed. It has no provider credential and cannot bootstrap, stage, deploy, promote, or roll back production.

Any future provider mutation requires a separately reviewed protected workflow, exact native Linear handoff, provider pins, compensation, rollback proof, and live readback before registration.
