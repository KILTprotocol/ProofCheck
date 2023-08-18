import { Utils } from '@kiltprotocol/sdk-js';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { configuration } from './configuration';

const signingKeyPairType = 'sr25519';

export const keypairsPromise = (async () => {
  await cryptoWaitReady();

  const payer = Utils.Crypto.makeKeypairFromUri(
    configuration.payerMnemonic,
    signingKeyPairType,
  );

  const authentication = Utils.Crypto.makeKeypairFromUri(
    configuration.authenticationMnemonic,
    signingKeyPairType,
  );

  const assertionMethod = Utils.Crypto.makeKeypairFromUri(
    configuration.assertionMethodMnemonic,
    signingKeyPairType,
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
