# SSX Quickstart

SSX Quickstart is an extremely basic Client/Server demo to help developers get their hands on a fully functional and easy to understand demo.

In this quickstart we will guide you to build an application by using SSX authorization and storage modules, and integrate with [Rebase](https://github.com/spruceid/rebase) for credential issuance.

A code-along tutorial can be found in the subfolders README.md and in the docs [here](https://www.sprucekit.dev/ssx/quickstart).

## Requirements

First, let’s make sure that your development environment is ready. 

- [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed;
- [MetaMask browser extension wallet](https://metamask.io/) installed;
- An Ethereum account in the installed MetaMask wallet.

## Running Each of the Examples

To run the first example, simply navigate to `00_create_project/my-app` and run the following:

```
npm i
npm run dev
```

To run the additional examples (`01`, `02`, and `03`), navigate to the `my-app` directory, and do the following:

- Create a new enviornment file named `.env.local`
- Populate that file with a `SSX_SIGNING_KEY` variable set to anything secure
- Run the following:

```
npm i
npm run dev
```

The example should now be running at `localhost:3000`. 
