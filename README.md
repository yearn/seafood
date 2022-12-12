# Seafood
Yearn dashboard for vault management and reporting

![favicon-256](https://user-images.githubusercontent.com/89237203/209074891-16c56321-774e-411c-9ca0-ffa1a7068ed5.png)

## Dev Environment Setup
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
In development seafood runs on port 3000 by default. So open a browser and go to http://localhost:3000



\><(((*> - Nooice!
