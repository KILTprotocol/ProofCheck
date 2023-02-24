import ky from 'ky';
import { IEncryptedMessage } from '@kiltprotocol/sdk-js';

import { paths } from './paths';
import { sessionHeader } from './sessionHeader';

import { Input } from './requestCredential';

export async function requestCredential(
  json: Input,
  sessionId: string,
): Promise<IEncryptedMessage> {
  const headers = { [sessionHeader]: sessionId };
  return ky.post(paths.requestCredential, { json, headers }).json();
}
