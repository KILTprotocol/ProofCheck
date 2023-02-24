import type {
  IAttestation,
  ICredentialPresentation,
} from '@kiltprotocol/sdk-js';
import {
  Attestation,
  ConfigService,
  Credential,
  CType,
  Message,
} from '@kiltprotocol/sdk-js';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import { Session, sessionMiddleware } from '../utilities/sessionStorage';
import { logger } from '../utilities/logger';
import { decrypt } from '../utilities/cryptoCallbacks';
import { trustedAttesters } from '../utilities/trustedAttesters';
import { socialCTypeIds } from '../utilities/supportedCType';

import { paths } from './paths';

interface Output {
  presentation: ICredentialPresentation;
  isAttested: boolean;
  attestation?: IAttestation;
}

async function handler(request: Request, response: Response): Promise<void> {
  try {
    logger.debug('Verification started');

    const message = await Message.decrypt(request.body, decrypt);
    const messageBody = message.body;
    logger.debug('Message decrypted');

    Message.verifyMessageBody(messageBody);
    const { type } = messageBody;

    if (type === 'reject') {
      response.status(StatusCodes.CONFLICT).send('Message contains rejection');
      return;
    }

    if (type !== 'submit-credential') {
      throw new Error('Unexpected message type');
    }

    const { session } = request as Request & { session: Session };
    if (!session.requestChallenge) {
      response.status(StatusCodes.FORBIDDEN).send('No request challenge');
      return;
    }
    const challenge = session.requestChallenge;

    const presentation = messageBody.content[0];
    try {
      await Credential.verifyPresentation(presentation, { challenge });

      const api = ConfigService.get('api');
      const attestation = Attestation.fromChain(
        await api.query.attestation.attestations(presentation.rootHash),
        presentation.rootHash,
      );

      const isAttested =
        !attestation.revoked &&
        attestation.cTypeHash === presentation.claim.cTypeHash;

      if (!trustedAttesters.includes(attestation.owner)) {
        response
          .status(StatusCodes.FORBIDDEN)
          .send('Not an attester we requested');
        return;
      }

      if (!socialCTypeIds.includes(CType.hashToId(attestation.cTypeHash))) {
        response.status(StatusCodes.FORBIDDEN).send('Not a CType we requested');
        return;
      }

      response.send({ presentation, isAttested, attestation } as Output);
    } catch {
      response.send({ presentation, isAttested: false } as Output);
    } finally {
      logger.debug('Verification completed');
    }
  } catch (error) {
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
  }
}

export const verify = Router();

verify.post(paths.verify, sessionMiddleware, handler);
