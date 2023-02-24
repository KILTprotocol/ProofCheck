import {
  Request,
  ResponseObject,
  ResponseToolkit,
  ServerRoute,
} from '@hapi/hapi';
import * as Boom from '@hapi/boom';
import { StatusCodes } from 'http-status-codes';

import { Did, DidResourceUri, Utils } from '@kiltprotocol/sdk-js';
import { randomAsHex } from '@polkadot/util-crypto';

import { didDocumentPromise } from '../utilities/didDocument';
import { decrypt } from '../utilities/cryptoCallbacks';
import { getBasicSession, setSession } from '../utilities/sessionStorage';

import { paths } from './paths';

export interface CheckSessionInput {
  encryptionKeyUri: DidResourceUri;
  encryptedChallenge: string;
  nonce: string;
}

async function handler(
  request: Request,
  h: ResponseToolkit,
): Promise<ResponseObject> {
  const { logger } = request;
  logger.debug('Session confirmation started');

  const payload = request.payload as CheckSessionInput;
  const { encryptionKeyUri, encryptedChallenge, nonce } = payload;
  const session = getBasicSession(request.headers);

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
    throw Boom.forbidden('Challenge signature mismatch');
  }

  setSession({
    ...session,
    did: encryptionKey.controller,
    encryptionKeyUri,
    didConfirmed: true,
  });

  logger.debug('Challenge confirmation matches');
  return h.response().code(StatusCodes.NO_CONTENT);
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

export interface GetSessionOutput {
  dAppEncryptionKeyUri: DidResourceUri;
  sessionId: string;
  challenge: string;
}

const path = paths.session;

export const session: ServerRoute[] = [
  {
    method: 'GET',
    path,
    handler: async () => {
      const { did, keyAgreementKey } = await didDocumentPromise;
      const dAppEncryptionKeyUri: DidResourceUri = `${did}${keyAgreementKey.id}`;
      return {
        dAppEncryptionKeyUri,
        ...startSession(),
      } as GetSessionOutput;
    },
  },
  {
    method: 'POST',
    path,
    handler,
  },
];
