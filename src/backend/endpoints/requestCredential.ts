import type {
  Request,
  ResponseObject,
  ResponseToolkit,
  ServerRoute,
} from '@hapi/hapi';
import { randomAsHex } from '@polkadot/util-crypto';
import { CType } from '@kiltprotocol/sdk-js';

import { SupportedCType, supportedCTypes } from '../utilities/supportedCType';
import { encryptMessageBody } from '../utilities/encryptMessage';
import { paths } from './paths';
import { getSession, setSession } from '../utilities/sessionStorage';

export interface Input {
  cType: SupportedCType;
}

async function handler(
  request: Request,
  h: ResponseToolkit,
): Promise<ResponseObject> {
  const { logger } = request;
  logger.debug('Request credential started');

  const { cType } = request.payload as Input;
  const session = getSession(request.headers);
  const { encryptionKeyUri } = session;

  const cTypeHash = CType.idToHash(supportedCTypes[cType].$id);
  logger.debug('Request credential CType found');

  const challenge = randomAsHex(24);
  setSession({ ...session, requestChallenge: challenge });
  const output = await encryptMessageBody(encryptionKeyUri, {
    content: {
      cTypes: [{ cTypeHash }],
      challenge,
    },
    type: 'request-credential',
  });

  logger.debug('Request credential completed');
  return h.response(output);
}

export const requestCredential = {
  method: 'POST',
  path: paths.requestCredential,
  handler,
} as ServerRoute;
