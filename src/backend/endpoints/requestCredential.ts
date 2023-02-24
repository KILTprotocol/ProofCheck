import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { randomAsHex } from '@polkadot/util-crypto';
import { CType, ICType } from '@kiltprotocol/sdk-js';

import { encryptMessageBody } from '../utilities/encryptMessage';
import { paths } from './paths';
import {
  Session,
  sessionMiddleware,
  setSession,
} from '../utilities/sessionStorage';
import { logger } from '../utilities/logger';
import { trustedAttesters } from '../utilities/trustedAttesters';

type Input = Array<ICType['$id']>;

async function handler(request: Request, response: Response): Promise<void> {
  try {
    logger.debug('Request credential started');

    const { session } = request as Request & { session: Session };
    const { encryptionKeyUri } = session;

    const cTypes = (request.body as Input).map((id) => ({
      cTypeHash: CType.idToHash(id),
      trustedAttesters,
    }));
    logger.debug('Request credential CType found');

    const challenge = randomAsHex(24);
    setSession({ ...session, requestChallenge: challenge });
    const output = await encryptMessageBody(encryptionKeyUri, {
      content: {
        cTypes,
        challenge,
      },
      type: 'request-credential',
    });

    logger.debug('Request credential completed');
    response.send(output);
  } catch (error) {
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
  }
}

export const requestCredential = Router();

requestCredential.post(paths.requestCredential, sessionMiddleware, handler);
