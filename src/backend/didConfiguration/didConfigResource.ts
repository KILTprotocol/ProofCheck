import {
  Claim,
  Credential,
  ICredentialPresentation,
} from '@kiltprotocol/sdk-js';

import { configuration } from '../utilities/configuration';
import { signWithAssertionMethod } from '../utilities/cryptoCallbacks';
import { exitOnError } from '../utilities/exitOnError';

import { domainLinkageCType } from './domainLinkageCType';
import { fromCredential } from './domainLinkageCredential';

async function attestDomainLinkage(): Promise<ICredentialPresentation> {
  const claimContents = {
    id: configuration.did,
    origin: configuration.baseUri,
  };

  const claim = Claim.fromCTypeAndClaimContents(
    domainLinkageCType,
    claimContents,
    configuration.did,
  );

  const credential = Credential.fromClaim(claim);

  return Credential.createPresentation({
    credential,
    // the domain linkage credential is special in that it is signed with the assertionMethod key
    signCallback: signWithAssertionMethod,
  });
}

export const didConfigResourcePromise = (async () => {
  const credential = await attestDomainLinkage();

  const domainLinkageCredential = fromCredential(credential);

  return {
    '@context': 'https://identity.foundation/.well-known/did-configuration/v1',
    linked_dids: [domainLinkageCredential],
  };
})();

didConfigResourcePromise.catch(exitOnError);
