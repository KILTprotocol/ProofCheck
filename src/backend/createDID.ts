import {
  BalanceUtils,
  Blockchain,
  ConfigService,
  Did,
  disconnect,
} from '@kiltprotocol/sdk-js';

import { configuration } from './utilities/configuration';
import { initKilt } from './utilities/initKilt';
import { keypairsPromise } from './utilities/keypairs';
import { logger } from './utilities/logger';

(async () => {
  await initKilt();

  if (configuration.did) {
    throw new Error(
      `DID ${configuration.did} already exists on the blockchain ${configuration.blockchainEndpoint}`,
    );
  }

  const { assertionMethod, authentication, payer, keyAgreement } =
    await keypairsPromise;

  const api = ConfigService.get('api');
  const balances = await api.query.system.account(payer.address);
  const free = balances.data.free;
  if (free.lt(BalanceUtils.toFemtoKilt(10))) {
    const freeText = BalanceUtils.formatKiltBalance(free);
    throw new Error(
      `The payer account ${payer.address} has insufficient funds ${freeText}`,
    );
  }

  const tx = await Did.getStoreTx(
    {
      authentication: [authentication],
      assertionMethod: [assertionMethod],
      keyAgreement: [keyAgreement],
    },
    payer.address,
    async ({ data }) => ({
      signature: authentication.sign(data, { withType: false }),
      keyType: authentication.type,
    }),
  );

  logger.warn(`Storing the DID on the blockchain…`);
  await Blockchain.signAndSubmitTx(tx, payer);

  const did = Did.getFullDidUriFromKey(authentication);
  logger.warn(`Add this to your .env: DID=${did}`);

  await disconnect();
})();
