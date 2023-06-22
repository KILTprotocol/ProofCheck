import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Did, Utils } from '@kiltprotocol/sdk-js';
import { randomAsHex } from '@polkadot/util-crypto';
import { didDocumentPromise } from '../utilities/didDocument';
import { decrypt } from '../utilities/cryptoCallbacks';
import {
  basicSessionMiddleware,
  setSession,
} from '../utilities/sessionStorage';
import { logger } from '../utilities/logger';
import { paths } from './paths';
async function handler(request, response) {
  try {
    logger.debug('Session confirmation started');
    const payload = request.body;
    const { encryptionKeyUri, encryptedChallenge, nonce } = payload;
    const { session } = request;
    const encryptionKey = await Did.resolveKey(encryptionKeyUri);
    logger.debug('Session confirmation resolved DID encryption key');
    const { keyAgreementKey, did } = await didDocumentPromise;
    const { data } = await decrypt({
      data: Utils.Crypto.coToUInt8(encryptedChallenge),
      nonce: Utils.Crypto.coToUInt8(nonce),
      keyUri: `${did}${keyAgreementKey.id}`,
      peerPublicKey: encryptionKey.publicKey,
    });
    logger.debug('Session confirmation decrypted challenge');
    const decryptedChallenge = Utils.Crypto.u8aToHex(data);
    const originalChallenge = session.didChallenge;
    if (decryptedChallenge !== originalChallenge) {
      response
        .status(StatusCodes.FORBIDDEN)
        .send('Challenge signature mismatch');
      return;
    }
    setSession({
      ...session,
      did: encryptionKey.controller,
      encryptionKeyUri,
      didConfirmed: true,
    });
    logger.debug('Challenge confirmation matches');
    response.sendStatus(StatusCodes.NO_CONTENT);
  } catch (error) {
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
  }
}
function startSession() {
  const sessionId = randomAsHex(24);
  const challenge = randomAsHex(24);
  setSession({ sessionId, didChallenge: challenge });
  return {
    challenge,
    sessionId,
  };
}
const path = paths.session;
export const session = Router();
session.get(path, async (request, response) => {
  const { did, keyAgreementKey } = await didDocumentPromise;
  const dAppEncryptionKeyUri = `${did}${keyAgreementKey.id}`;
  response.send({
    dAppEncryptionKeyUri,
    ...startSession(),
  });
});
session.post(path, basicSessionMiddleware, handler);
