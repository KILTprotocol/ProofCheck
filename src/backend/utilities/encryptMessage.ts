import type {
  DidResourceUri,
  IEncryptedMessage,
  MessageBody,
} from '@kiltprotocol/sdk-js';
import { Did, Message } from '@kiltprotocol/sdk-js';

import { encrypt } from './cryptoCallbacks';
import { configuration } from './configuration';

export async function encryptMessageBody(
  encryptionKeyUri: DidResourceUri,
  messageBody: MessageBody,
): Promise<IEncryptedMessage> {
  const { did } = Did.parse(encryptionKeyUri);

  const message = Message.fromBody(messageBody, configuration.did, did);
  return Message.encrypt(message, encrypt, encryptionKeyUri);
}
