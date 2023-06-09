import { cwd } from 'node:process';
import path from 'node:path';

import { config } from 'dotenv';
import { pino } from 'pino';
import { DidUri } from '@kiltprotocol/sdk-js';

config();

class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    pino().fatal(message);
    process.exit(1);
  }
}

const { env } = process;

const baseUri = env.URL;
if (!baseUri) {
  throw new ConfigurationError('URL is not provided');
}

const did = env.DID as DidUri;

const payerMnemonic = env.SECRET_PAYER_MNEMONIC;
if (!payerMnemonic) {
  throw new ConfigurationError('SECRET_PAYER_MNEMONIC is not provided');
}
const authenticationMnemonic = env.SECRET_AUTHENTICATION_MNEMONIC;
if (!authenticationMnemonic) {
  throw new ConfigurationError(
    'SECRET_AUTHENTICATION_MNEMONIC is not provided',
  );
}
const assertionMethodMnemonic = env.SECRET_ASSERTION_METHOD_MNEMONIC;
if (!assertionMethodMnemonic) {
  throw new ConfigurationError(
    'SECRET_ASSERTION_METHOD_MNEMONIC is not provided',
  );
}
const keyAgreementMnemonic = env.SECRET_KEY_AGREEMENT_MNEMONIC;
if (!keyAgreementMnemonic) {
  throw new ConfigurationError('SECRET_KEY_AGREEMENT_MNEMONIC is not provided');
}

const blockchainEndpoint = env.BLOCKCHAIN_ENDPOINT;
if (!blockchainEndpoint) {
  throw new ConfigurationError('No blockchain endpoint provided');
}

export const configuration = {
  port: parseInt(env.PORT as string) || 3000,
  blockchainEndpoint,
  baseUri,
  distFolder: path.join(cwd(), 'dist', 'frontend'),
  did,
  payerMnemonic,
  authenticationMnemonic,
  assertionMethodMnemonic,
  keyAgreementMnemonic,
};
