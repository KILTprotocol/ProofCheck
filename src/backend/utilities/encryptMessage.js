import { Did, Message } from '@kiltprotocol/sdk-js';
import { encrypt } from './cryptoCallbacks';
import { configuration } from './configuration';
export async function encryptMessageBody(encryptionKeyUri, messageBody) {
  const { did } = Did.parse(encryptionKeyUri);
  const message = Message.fromBody(messageBody, configuration.did, did);
  return Message.encrypt(message, encrypt, encryptionKeyUri);
}
