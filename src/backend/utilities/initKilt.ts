import { connect } from '@kiltprotocol/sdk-js';

import { configuration } from './configuration';

export async function initKilt(): Promise<void> {
  await connect(configuration.blockchainEndpoint);
}
