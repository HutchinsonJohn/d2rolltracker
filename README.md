## Installation

### Pre-requisites

1. Install [NodeJS](https://nodejs.org/)
1. Install [PNPM](https://pnpm.io/installation)

### Clone the repo

```sh
git clone https://github.com/HutchinsonJohn/d2rolltracker.git
```

### Get your Bungie.net API key (optional)

1. Go to [Bungie's Dev Portal](https://www.bungie.net/en/Application) (must be signed in)
1. Click `Create New App`
1. Enter anything under Application Name and Website
1. For OAuth Client Type, select `Confidential`
1. Set Redirect URL to `https://localhost:3000/OAuth`
1. For Scope, select `Read your Destiny 2 information (Vault, Inventory, and Vendors), as well as Destiny 1 Vault and Inventory data. `
1. For Origin Header, enter `*`
1. Agree to the Terms of Use and Create New App

### Setup .env

1. Rename `.env.example` to `.env`
1. Using the keys from your bungie.net application, enter your `X_API_KEY` and `OAUTH_ID` in .env (optional)
1. If you would like to use [your own backend](https://github.com/HutchinsonJohn/d2rolltracker-backend), set the public tokens to the corresponding tokens in your backend's .env. Otherwise rolls will be created and modified on the public database. (optional)

### Start Dev Server

1. Run pnpm install
1. Run pnpm dev
