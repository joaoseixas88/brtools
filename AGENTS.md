# AGENTS.md

## Project Shape

- This is a TypeScript CLI package; the published `brtools` binary points to `dist/index.js`, while the source entrypoint is `src/index.ts`.
- Command wiring is dynamic: `ProgramStarter` recursively imports every `src/modules/**/commander.ts` or `commander.js`. Add a `commander.ts` default export to register a new command; there is no central command list to update.
- Command modules normally extend `CliModule`, put behavior in `perform()`, and register actions with `makeModule(Module)`.
- `CliModule.handle()` logs/copies output and calls `process.exit(0)` unless `NODE_ENV=test`; unit tests usually call `perform()` directly or must set `NODE_ENV=test` before invoking `handle()`.
- CNPJ validation intentionally supports alphanumeric CNPJ values; existing tests include `0R.K5Y.XY8/0001-19`.

## Commands

- Install with `pnpm install --frozen-lockfile`; the repo has `pnpm-lock.yaml` and scripts fail before dependencies are installed.
- Full local verification: `pnpm lint`, `pnpm build`, then `pnpm test`.
- Release verification: `pnpm release:check` runs lint, build, tests, and `npm pack --dry-run`.
- Publishing patch releases: `pnpm release:patch` runs verification, bumps patch version, and publishes with `--access public`; do not run it unless the user explicitly asks to publish.
- GitHub Actions publishes on push to `main` only when `package.json` version is not already on npm; it requires the `NPM_TOKEN` repository secret.
- Focused test: `pnpm exec jest src/modules/cpf/cpf.spec.ts --runInBand`.
- Related-file test: `pnpm exec jest --findRelatedTests src/modules/cpf/index.ts`.
- Local CLI smoke test: `pnpm build && node dist/index.js cpf --generate`.
- Avoid `--copy` in smoke tests unless clipboard tooling is available; Linux copy support depends on `xclip`.

## Tooling Quirks

- `tsconfig.json` compiles CommonJS from `src` to `dist` and excludes `*.spec.ts`, `*.test.ts`, `__tests__`, and `jest.config.ts`.
- `dist/`, `coverage/`, `node_modules/`, and `*.tgz` are generated/ignored; do not add them to commits.
- Published packages are built by `prepack` and should include `dist/` plus `README.md`, not `src/` or tests.
- Jest is rooted at `src`, uses `@swc/jest`, always collects coverage, and has `silent: true`, so console output is hidden in test runs.
- The pre-commit hook runs `pnpm lint-staged`; staged `*.{ts,js,json}` files get related Jest tests, `eslint --fix`, and Prettier.
- `prepare` is reserved for Husky; use `prepack`/`npm pack --dry-run` to verify package contents before publishing.

## Text And Style

- User-facing CLI output is Portuguese; preserve correct accentuation when editing messages.
- Keep technical identifiers, file names, logs, and internal errors in English unless an existing API already uses a different name.
