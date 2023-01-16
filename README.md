# Seafood
Yearn dashboard for vault management and reporting

![favicon-256](https://user-images.githubusercontent.com/89237203/209074891-16c56321-774e-411c-9ca0-ffa1a7068ed5.png)


- [Dev environment setup](#dev-environment-setup)
- [Tests](#tests)
- [Project structure](#project-structure)
- [Contributing](#contributing)


## Dev environment setup
In production seafood currently runs on nodejs version 16. For an easy way to install a particular node version in your dev environment, or multiple node versions on the same system, try Node Version Manager (NVM). See https://github.com/nvm-sh/nvm#install--update-script for install instructions.

1 - With NVM installed, install node 16 and yarn:
```console
nvm install 16
npm install -g yarn
```
* NVM is optional, feel free to install node however you like.

2 - Clone this repo and install seafood's dependencies:
```console
git clone git@github.com:yearn/dashboard_ui.git
cd dashboard_ui
(yarn && cd api && yarn)
```

3 - Configure local environment variables
```console
cp env.example .env
```

  - For minimum functionality, set these envars:
  ```
  REACT_APP_DB_USER=
  REACT_APP_DB_PASS=
  ```
  If you don't have these credentials, ask someone at yearn.

  - To run vault and strategy simulations, set a token for tenderly and explorer urls for each supported chain:
  ```
  TENDERLY_ACCESS_TOKEN=
  EXPLORER_API_FOR_1=
  EXPLORER_API_FOR_250=
  EXPLORER_API_FOR_10=
  EXPLORER_API_FOR_42161=
  ```
  To get a token, first create an account on https://tenderly.co. Then from your tenderly dashboard go to Settings, Authorization, Generate Access Token. Your tenderly account also needs access to yearn's tenderly organization account. To get access, ask someone at yearn to invite you.

  You can use your own explorer urls, but without premium access you'll likely get rate limit errors in seafood. Better, yearn also hosts its own internal block explorers that work great with seafood. To get these, ask someone at yearn.


4 - Run the app:
```console
yarn start
```
Open a browser at http://localhost:3000


## Tests
Seafood uses Jest for testing. Run tests like this:
```console
yarn test
```


## Project structure
### backend
`/api` - Resources for serving Seafood's backend api.
`/api/routes/vision` - Facades over Yearn's vision api.
`/api/routes/abi` - Smart contract abis with a twist of cache.
`/api/routes/getVaults` - Vault and strategy related data. (obsoleting)
`/api/routes/github` - Generate GitHub bearer tokens for Seafood users.
`/api/routes/tenderly` - Generate Tenderly simulation forks.

### frontend
`/public` - Static files.
`/scripts` - Various helper scripts used during dev. (obsoleting)
`/src` - Resources for building Seafood's frontend.
`/src/abi` - Some static abis that are needed by Seafood and some that..aren't 👀
`/src/apy` - Logic for computing APY on demand.
`/src/components` - Most of Seafood's React components go here
`/src/components/controls` - Specifically, common UI controls live here.
`/src/context` - Seafood's React hooks live here. So why call it `context`?
`/src/ethereum` - Various utilities for querying RPCs. (obsoleting)
`/src/pages` - Maybe this was a Nextjs project once? (obsoleting)
`/src/utils` - Various utilities that seemed happiest in a folder called `utils` 😁
`/src/config.json` - This was a more convenient way to configure previous versions of Seafood. It moves to envars eventually.


## Contributing
- To contribute: [fork](https://github.com/yearn/dashboard_ui/fork), branch from `main`, make changes, pull request.
- Use Typescript instead of Javascript for anything new.
- This project is configured to automatically enforce linting and style rules.
- CSS. For frontend layout and styling Seafood uses Tailwinds and follows their [utility-first](https://tailwindcss.com/docs/utility-first) principle.
- Tests. For now, Seafood only requires tests for domain logic and doesn't cover frontend\UI logic. So if your work requires complex domain logic, like computing APY, include tests for it. If you're just adding some buttons, no worries, amigo 😎
- Documentation. Seafood prefers readable, self-documenting code over comments.


\><(((*> - Onward!
