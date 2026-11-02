STATUS: done
OUT:
- frontend/src/services/{http,auth,user,property,contract,transaction}.service.ts — static classes, no storage, DTO aliases removed
- frontend/src/utils/{finance,format}.ts — static class utils
- frontend/src/enums/*.ts + frontend/src/enums/badge-tones.ts — enums + labels (badges.ts deleted)
- frontend/src/stores/{auth,PiniaConfig}.ts — PiniaConfig only localStorage user
- frontend/src/config/{app.config,chart.config}.ts — English ordered config
- frontend/src/router/index.ts — English guard comment
- frontend/src/main.ts — title separator `-`
- frontend/{package.json,pnpm-lock.yaml,pnpm-workspace.yaml,eslint.config.js,.prettierrc,.prettierignore,playwright.config.ts,tests/smoke.spec.ts,Dockerfile,nginx.conf,.env.example,README.md}
- .gitignore + frontend/.gitignore — English comments, deduped
- .github/workflows/frontend.yml — CI checks
- deleted: frontend/.prettierrc.json, frontend/package-lock.json, frontend/src/utils/badges.ts, frontend/dist/
FIND:
- pnpm typecheck PASS (vue-tsc --noEmit)
- pnpm build PASS (vite build)
- pnpm exec eslint src/services src/utils src/stores src/enums src/interfaces src/dtos src/config src/router src/main.ts PASS
- pnpm exec prettier --check <same paths> PASS
- pnpm test:e2e PASS (2 smoke tests)
- src/views + src/components lint errors = 47 (import/order + sort-imports), expected for next task
- auth.service has no localStorage/keyring_session logic
- services use HTTP base HttpClient, credentials in POST body
- remaining Create*DTO aliases only in views (next task cleanup)
NEED: none
RISK: none
