# 🥩 STEAK-IT

A simple web app for guessing BTC prices and winning 🥩s.

## Description

Steak-it is a Remix.run based web app that allows users to place a a bet on the ever-changing prices of Bitcoin (BTC). User's bet will be evaluated in real-time, and if their guess is correct, they will earn 1 point towards their score.

### Rules

1. Users can only place one bet at a time
2. After 1 minute, the current rate of BTC will be checked
3. If the price has increased/decreased, the user will get one score

## Development

### Prerequisites

- Node.js (v20.10.0)
- PNPM
- Working AWS Credentials

### Setup

Steak-it uses SST for development and deployment processes, and as such, it relies on a **working AWS credentials** for projects setup. SST will provision the necessary infrastructure (AWS DynamoDB tables, AWS Lambda), and bind the resources to the development machine when working in development mode:

1. `pnpm i` - Install dependencies
2. `pnpm sst:dev` - Provision the necessary AWS resources.

Once the resources have been provisioned, the app can be started from a new terminal window by running:

1. `pnpm dev`

You can now access the app on `http://localhost:3000`

## Project Structure

Stake-it is a Remix.run full-stack app. The web app source code can be found in `/app`:

- Routing and rednering is done by Remix.run and React
- Remix.run loader and action are used for fetching relevant user data and submitting scores
- Themeing is done via Tailwind and shadcn-ui
- User guess is evaluated via a Remix resource handler (i.e. Lambda function) via Server-sent events
- Tests are implemented in vitest and cypress.io

### Testing

To support full-stack development, different types of unit tests have been implemented:

- Component tests via @testing-library/react
- Integration tests via SST resource binding
- Cypress.io E2E tests

### CI/CD

Steak-it uses GitHub Actions to run the CI/CD checks before deploying the app
