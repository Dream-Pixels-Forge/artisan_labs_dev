# Deployment Automation Guide

Complete guide to automating Vercel deployments with GitHub Actions.

## GitHub Actions Workflows

### Production Deployment

Create `.github/workflows/vercel-production.yml`:

```yaml
name: Vercel Production Deployment

on:
  push:
    branches:
      - main

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  deploy-production:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install Dependencies
        run: bun install

      - name: Type Check
        run: bun run type-check || echo "No type-check script"

      - name: Lint
        run: bun run lint || echo "No lint script"

      - name: Build
        run: bun run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Preview Deployment

Create `.github/workflows/vercel-preview.yml`:

```yaml
name: Vercel Preview Deployment

on:
  pull_request:
    branches:
      - main

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  deploy-preview:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install Dependencies
        run: bun install

      - name: Type Check
        run: bun run type-check || echo "Skipping type-check"

      - name: Build
        run: bun run build

      - name: Deploy to Vercel (Preview)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Combined Workflow

Create `.github/workflows/vercel.yml`:

```yaml
name: Vercel Deployment

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  lint-and-build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install Dependencies
        run: bun install --frozen-lockfile

      - name: Type Check
        run: bun run type-check || echo "No type-check script"

      - name: Lint
        run: bun run lint || echo "No lint script"

      - name: Build
        run: bun run build

  deploy:
    needs: lint-and-build
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install Dependencies
        run: bun install

      - name: Build
        run: bun run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Setting Up Secrets

### Getting Vercel IDs

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Link to project:
```bash
vercel link
```

3. Get IDs:
```bash
vercel link --yes
cat .vercel/project.json
```

### Adding Secrets to GitHub

1. Go to **Repository Settings** → **Secrets and variables** → **Actions**
2. Add these secrets:

| Secret | Description | How to Get |
|--------|-------------|------------|
| `VERCEL_TOKEN` | Vercel API token | [Vercel Tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Organization ID | `vercel projects ls` or project.json |
| `VERCEL_PROJECT_ID` | Project ID | `vercel projects ls` or project.json |

### Creating Vercel Token

1. Go to [Vercel Tokens](https://vercel.com/account/tokens)
2. Click **Create Token**
3. Name: `GitHub Actions`
4. Scopes: Select appropriate scopes
5. Copy and save the token (won't show again)

## Branch-Based Deployments

### Multiple Environments

```yaml
name: Vercel Deployment

on:
  push:
    branches:
      - main
      - develop

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install
        run: bun install

      - name: Build
        run: bun run build

      - name: Deploy
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: ${{ github.ref == 'refs/heads/main' && '--prod' || '' }}
```

## Scheduled Deployments

### Daily Production Deploy

```yaml
name: Daily Production Deploy

on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight UTC

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Install
        run: bun install

      - name: Build
        run: bun run build

      - name: Deploy
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Deployment Status Badges

### Add to README

```markdown
[![Vercel Deployment](https://deploy-status-vercel-liard.vercel.app/api/repo/Dream-Pixels-Forge/artisan_labs_dev)](https://vercel.com/Dream-Pixels-Forge/artisan_labs_dev)
```

## Caching

### Bun Cache

```yaml
- name: Setup Bun
  uses: oven-sh/setup-bun@v1
  with:
    bun-version: latest

- name: Cache bun dependencies
  uses: actions/cache@v3
  with:
    path: ~/.bun/install/cache
    key: ${{ runner.os }}-bun-${{ hashFiles('**/bun.lockb') }}
    restore-keys: |
      ${{ runner.os }}-bun-
```

### Node Modules Cache

```yaml
- name: Cache node_modules
  uses: actions/cache@v3
  with:
    path: node_modules
    key: ${{ runner.os }}-npm-${{ hashFiles('package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-npm-
```

## Testing Before Deploy

### Add Test Step

```yaml
- name: Run Tests
  run: bun run test

- name: Run E2E Tests
  run: bun run test:e2e
```

### Using Playwright

```yaml
- name: Install Playwright Browsers
  run: npx playwright install --with-deps

- name: Run Tests
  run: bun run test:e2e
```

## Complete Workflow Example

```yaml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install
        run: bun install --frozen-lockfile

      - name: Type Check
        run: bun run type-check

      - name: Lint
        run: bun run lint

      - name: Test
        run: bun run test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install
        run: bun install

      - name: Build
        run: bun run build

  deploy:
    needs: build
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install
        run: bun install

      - name: Build
        run: bun run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Manual Deployments

### Workflow Dispatch

```yaml
name: Manual Deploy

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment'
        required: true
        default: 'production'
        type: choice
        options:
          - production
          - staging

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: ${{ github.event.inputs.environment == 'production' && '--prod' || '' }}
```

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Token invalid | Regenerate at vercel.com/account/tokens |
| Org ID wrong | Get from `vercel projects ls` |
| Build fails | Run `bun run build` locally first |
| Timeout | Increase in vercel.json |

### Debug Mode

```yaml
- name: Deploy
  uses: amondnet/vercel-action@v25
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
    vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
    vercel-args: '--prod --debug'
```

## References

- [Vercel GitHub Action](https://github.com/amondnet/vercel-action)
- [GitHub Actions](https://github.com/features/actions)
- [Bun GitHub Action](https://github.com/oven-sh/setup-bun)
