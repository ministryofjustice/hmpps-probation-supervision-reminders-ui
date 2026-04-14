# hmpps-probation-supervision-reminders-ui

[![Ministry of Justice Repository Compliance Badge](https://github-community.service.justice.gov.uk/repository-standards/api/hmpps-probation-supervision-reminders-ui/badge?style=flat)](https://github-community.service.justice.gov.uk/repository-standards/hmpps-probation-supervision-reminders-ui)
[![Docker Repository on ghcr](https://img.shields.io/badge/ghcr.io-repository-2496ED.svg?logo=docker)](https://ghcr.io/ministryofjustice/hmpps-probation-supervision-reminders-ui)

## Get started

### Pre-requisites

You'll need to install:

- [Node 24.x](https://nodejs.org/en/download) - Node and nvm installation. 
- [Docker](https://www.docker.com/)
- [Latest version of Java with Homebrew](https://formulae.brew.sh/formula/openjdk#default) - Needed for wiremock

1. Create a copy of `.env.example` named `.env`.
2. Replace example placeholder values in `.env` with real values for your local setup (for example auth/API client IDs, secrets, and token-related values).
3. Install dependencies with `npm run setup` (Node v24).
4. Start the app with `npm run start:dev`.

### Dependencies

Install NPM package dependencies:

```shell
npm run setup

```

### Run the service

```shell
# Start the UI in test mode
npm run start-feature:dev
```
Open http://localhost:3007 in your browser.

### Integrate with dev services

- Request access for 1password, on the [#ask-operations-engineering](https://moj.enterprise.slack.com/archives/C01BUKJSZD4) channel. Once access granted, create a `.env` file and copy the environmental variables from 1password to your `.env`.
- Request user access for development and test, complete the Delius User Access Request form.

```shell
npm run start:dev
```

Open http://localhost:3000 in your browser.

## Formatting

### Check formatting

`npm run lint`

### Fix formatting

`npm run lint-fix`

## Testing

### Run unit tests

`npm run test`

### Running integration tests

Run Playwright integration tests with `npm run int-test`.

### Dependency Checks

If these are not desired in the cloned project, remove or disable any CI jobs related to dependency update checks (for example, jobs named `check_outdated`).
