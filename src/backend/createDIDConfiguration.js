import { mkdir, writeFile, lstat } from 'node:fs/promises';
import { join } from 'node:path';
import { disconnect } from '@kiltprotocol/sdk-js';
import { configuration } from './utilities/configuration';
import {
  attestDomainLinkage,
  fromCredential,
} from './utilities/domainLinkageCredential';
(async () => {
  console.log(
    `Generating the .well-known/did-configuration.json file for DID ${configuration.did} and host ${configuration.baseUri}`,
  );
  const wellKnown = join(configuration.distFolder, '.well-known');
  try {
    await lstat(wellKnown);
  } catch (error) {
    console.warn(
      'Looks like the .well-known folder doesn’t exist, creating',
      error.message,
    );
    await mkdir(wellKnown);
  }
  const credential = await attestDomainLinkage();
  const domainLinkageCredential = fromCredential(credential);
  const didConfigurationResource = {
    '@context': 'https://identity.foundation/.well-known/did-configuration/v1',
    linked_dids: [domainLinkageCredential],
  };
  const json = JSON.stringify(didConfigurationResource);
  const path = join(wellKnown, 'did-configuration.json');
  await writeFile(path, json);
  await disconnect();
})();
