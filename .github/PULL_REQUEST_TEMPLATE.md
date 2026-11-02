## Summary

Brief description of the change and the problem it solves.

## Linked issue

Closes #ISSUE_NUMBER

## Verification checklist

- [ ] `pnpm lint` passes for every changed app.
- [ ] `pnpm format:check` passes for every changed app.
- [ ] `pnpm typecheck` passes for every changed app.
- [ ] `pnpm build` succeeds for every changed app.
- [ ] `pnpm test:e2e` passes for every changed app with E2E coverage.
- [ ] `docker compose config` is valid (run from the repository root).
- [ ] All relative links in `README.md` and other docs resolve to an existing file.
- [ ] No secrets, tokens, or local environment files were committed.

## Screenshots / evidence

Add screenshots, logs, or other evidence that the change works as intended.
