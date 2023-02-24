import ky from 'ky';
import { IEncryptedMessage } from '@kiltprotocol/sdk-js';

import { paths } from './paths';
import { sessionHeader } from './sessionHeader';

import { Output } from './verify';

export async function verifyCredential(
  json: { message: IEncryptedMessage },
  sessionId: string,
): Promise<Output> {
  const headers = { [sessionHeader]: sessionId };
  return ky.post(paths.verify, { json, headers }).json();
}
