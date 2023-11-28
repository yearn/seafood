# Seafood
Seafood is a vault monitoring dashboard that simulates operations like harvests and allocation changes while tracking asset flows and APY changes.

![mechafish-md](https://github.com/yearn/seafood/assets/89237203/794251a0-6ef6-407a-a890-467e9a7b8225)

- [Dev environment setup](#dev-environment-setup)
- [Project structure](#project-structure)
- [Tests](#tests)
- [Contributing](#contributing)


## Dev environment setup
First get node installed. For an easy way to install a particular node version in your dev environment, or multiple node versions on the same system, try Node Version Manager (NVM). See https://github.com/nvm-sh/nvm#install--update-script for install instructions.

1 - With NVM installed, install node 16 (or higher) and yarn
```console
nvm install 16 # or later
npm install -g yarn
```

2 - Clone this repo, install dependencies
```console
git clone git@github.com:yearn/seafood.git
cd seafood
(yarn && cd api && yarn)
```

3 - Configure local environment variables
```console
cp env.example .env
```

  - For data
  ```
  REACT_APP_USE_KONG=true
  REACT_APP_KONG_API_URL=https://kong-one.vercel.app/api/gql
  ```

  Or if you like, setup and run [kong](https://github.com/murderteeth/kong) in your local environment and use:
  ```
  REACT_APP_USE_KONG=true
  REACT_APP_KONG_API_URL=http://localhost:3000/api/gql
  ```

  - To run vault and strategy simulations, set a token for tenderly, explorer urls, and rps urls for each supported chain:
  ```
  TENDERLY_ACCESS_TOKEN=
  EXPLORER_API_FOR_1=
  EXPLORER_API_FOR_250=
  EXPLORER_API_FOR_10=
  EXPLORER_API_FOR_42161=
  RPC_URI_FOR_1=
  RPC_URI_FOR_250=
  RPC_URI_FOR_10=
  RPC_URI_FOR_42161=
  ```
  To get a token, first create an account on https://tenderly.co. Then from your tenderly dashboard go to Settings, Authorization, Generate Access Token. Your tenderly account also needs access to yearn's tenderly organization account. To get access, ask someone at yearn for an invite.

  You can use your own explorer and rpc urls, but without premium access you'll likely get rate limit errors in seafood. You can also ask someone at yearn for access to internal explorer and rpc urls.


4 - Run the app
```console
cd ~/git/seafood # or wherever you cloned it
yarn start
```
Open a browser at http://localhost:3000


## Project structure
### backend
`/api` - Resources for serving Seafood's backend api \
`/api/routes/vision` - Facades over Yearn's vision api \
`/api/routes/abi` - Smart contract abis \
`/api/routes/getVaults` - Vault and strategy related data. (obsoleting) \
`/api/routes/github` - Generate GitHub bearer tokens for Seafood users \
`/api/routes/tenderly` - Generate Tenderly simulation forks \
`/api/routes/tradeables` - List tradeable erc20s for a given trade handler


### frontend
`/public` - Static files \
`/scripts` - Help scripts used in dev \
`/src` - Resources for building Seafood's frontend \
`/src/abi` - Some static abis that are needed by Seafood and some that..aren't 👀 \
`/src/math` - Logic for computing APY and APR on demand \
`/src/components` - Most of Seafood's React components go here \
`/src/components/controls` - Specifically, common UI controls live here \
`/src/context` - Seafood's React hooks live here. So why call it `context`? \
`/src/ethereum` - Various utilities for querying RPCs. (obsoleting) \
`/src/utils` - Various utilities that seemed happiest in a folder called `utils` 😁 \
`/src/config.json` - This was a more convenient way to configure previous versions of Seafood. It moves to envars eventually


## Tests
Seafood uses Jest for testing. Some tests require rpc integration, so first set this envar:
```
TEST_RPC=<eg, your infura mainnet url>
```
Infura not required, but you'll need a premium rpc or your own node to test.

Run tests like this:
```console
yarn test
```


## Contributing
- To contribute: [fork](https://github.com/yearn/dashboard_ui/fork), branch from `main`, make changes, pull request.
- Use Typescript instead of Javascript for anything new.
- This project is configured to automatically enforce linting and style rules.
- CSS. For frontend layout and styling Seafood uses Tailwinds and follows their [utility-first](https://tailwindcss.com/docs/utility-first) principle.
- Tests. For now, Seafood only requires tests for domain logic and doesn't cover frontend\UI logic. So if your work requires complex domain logic, like computing APY, include tests for it. If you're just adding some buttons, no worries, amigo 😎
- Documentation, minimal. We have GPT now for crying out loud 🤖

\><(((*> - Onward!
