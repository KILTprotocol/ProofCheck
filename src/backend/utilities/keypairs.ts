import { Utils } from '@kiltprotocol/sdk-js';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { configuration } from './configuration';

export const keypairsPromise = (async () => {
  await cryptoWaitReady();

  const payer = Utils.Crypto.makeKeypairFromUri(configuration.payerMnemonic);

  const authentication = Utils.Crypto.makeKeypairFromUri(
    configuration.authenticationMnemonic,
  );

  const assertionMethod = Utils.Crypto.makeKeypairFromUri(
    configuration.assertionMethodMnemonic,
  );

  const keyAgreement = Utils.Crypto.makeEncryptionKeypairFromSeed(
    Utils.Crypto.mnemonicToMiniSecret(configuration.keyAgreementMnemonic),
  );

  return {
    payer,
    authentication,
    assertionMethod,
    keyAgreement,
  };
})();
