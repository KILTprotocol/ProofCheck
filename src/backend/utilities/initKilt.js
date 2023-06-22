import { connect } from '@kiltprotocol/sdk-js';
import { configuration } from './configuration';
export async function initKilt() {
  await connect(configuration.blockchainEndpoint);
}
