# ProofCheck dApp: KILT Verifier Example

An example web application verifying the KILT credentials using the [KILT Credential API](https://github.com/KILTprotocol/spec-ext-credential-api#verification-workflow)

## Wallet

The following steps assume that you already have a wallet which implements the [KILT Credential API](https://github.com/KILTprotocol/spec-ext-credential-api), such as Sporran.

[You can follow these steps to run Sporran in developer mode](https://github.com/BTE-Trusted-Entity/sporran-extension/blob/main/docs/external.md)

You will also need a credential in your wallet (like the ones issued by [SocialKYC](https://socialkyc.io/)).

## Quick test

The simplest way to try this out (if you know docker) is to start a pre-made docker container:

```shell
docker run -p 3000:3000 kiltprotocol/proof-check
```

Once the container starts, access it on http://localhost:3000.

## Testing in developer mode

The application is written in Javascript/Typescript, so we assume you already have a recent version of Node.js installed.

The first steps are getting the code and installing its dependencies.

```shell
git clone git@github.com:KILTprotocol/ProofCheck.git
yarn install
```

The script `yarn dev` runs in watch mode and recompiles the code if you change it. After it finishes you can keep it running or stop it.

```shell
yarn dev
```

You’ll need a domain linkage credential for your configuration. By default, it’s valid for 5 years, so probably you’ll only need to run this step once:

```shell
yarn did-configuration
```

Finally, start the application:

```shell
yarn dev-start
```


## Rolling your own verifier

### Real coins and testing coins

The KILT blockchain with real coins and real attestations is called Spiritnet. This example by default uses a testing blockchain called Peregrine, [more details on this below](#production-configuration). This documentation uses the term “coins” to refer to the coins on both blockchains.


### One-time steps

Some steps only need to be done once. Those scripts do not have to be a part of your application, and you can run them inside this repository. You have first to perform the steps above to build the code.

The first thing your verifier will need is some coins on a payer blockchain account. They will be needed to pay for storing on the blockchain the verifier’s DID with several keys. The account and each key will be defined by a secret 12-words mnemonic. A mnemonic can be generated using this command:

```shell
node -e "console.log(require('@polkadot/util-crypto').mnemonicGenerate())"
```

Pass the mnemonics to the application by writing them into `.env` file or by configuring environment variables:

```
SECRET_PAYER_MNEMONIC=stable during …
SECRET_AUTHENTICATION_MNEMONIC=setup inside …
SECRET_ASSERTION_METHOD_MNEMONIC=about spoil …
SECRET_KEY_AGREEMENT_MNEMONIC=airport excuse …
```

Then you can run the following script to generate your DID with keys and store it on the blockchain:

```shell
yarn did-create
```

If it complains about insufficient funds you can charge the account with some testing coins using the [Faucet](https://faucet.peregrine.kilt.io/). After the script completes successfully you should write down the DID from the output to the `.env` file or environment variables.

Now you will need to create a domain linkage credential. It includes the domain name, so you will need such a credential for every domain you intend to run your code on (production, staging, development, etc.) Configure the domain in `.env` file or environment variables:

```
URL=http://example.com
# Must include the port if run on non-standard port, like URL=http://localhost:3000
```

Generate the credential:

```shell
yarn did-configuration
```

The file will be generated as `./dist/frontend/.well-known/did-configuration.json`. When you’re running your verifier application, this file has to be accessible on the URL like this one: `http://example.com/.well-known/did-configuration.json`. Its HTTP headers must include `Access-Control-Allow-Origin: *`. If you do not automate the generation of this credential, schedule to repeat re-generation shortly before it expires in 5 years.


### Reusing the code

The rest of the code is split into basic React frontend and simple Express backend.

Frontend’s primary task here is to pass data between the wallet and the backend HTTP API. You have full freedom to choose any or even no framework to do that and to handle the validation results. We picked React as a *lingua franca*.

Neither you’re bound to Express on the backend implementation. (In fact, our own verifier uses Hapi.js.) You might want to reuse more of this code, however, due to the complexity of the flow.


### Production configuration

By default, this example uses Peregrine, which is the testing instance of the KILT blockchain. Peregrine is not intended for real-world usage. The production instance of your verifier **must** work with the main KILT blockchain, called Spiritnet. Spiritnet does not share any data with Peregrine, so the DID you created on Peregrine will not exist on Spiritnet. You **should** generate a different set of mnemonics/keys for the production instance of your verifier. You will need to run the scripts again to create the DID and the domain linkage credential. To configure scripts to work with Spiritnet, change the value of `BLOCKCHAIN_ENDPOINT` from `wss://peregrine.kilt.io` to `wss://kilt-rpc.dwellir.com`. You should also use the [public version of Sporran](https://www.sporran.org/) which connects to Spiritnet by default.

## Trust

You’re free to choose which CTypes your verifier will accept. They are basically just formats for the data. Remember that you can specify `requiredProperties` for each of them. Still, we recommend requesting only what you absolutely must have.

You **should** choose the Attesters your verifier will trust, because anyone could call themselves an attester. You can pass the list of trusted attesters’ DIDs as `trustedAttesters`. Keep in mind that attesters could have different DIDs on Spiritnet and Peregrine.
