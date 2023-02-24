import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import NodeCache from 'node-cache';
import { DidResourceUri, DidUri } from '@kiltprotocol/sdk-js';

import { sessionHeader } from '../endpoints/sessionHeader';

export interface BasicSession {
  sessionId: string;
  did?: DidUri;
  encryptionKeyUri?: DidResourceUri;
  didChallenge?: string;
  didConfirmed?: boolean;
  requestChallenge?: string;
}

export type Session = BasicSession & {
  did: DidUri;
  encryptionKeyUri: DidResourceUri;
};

const sessionStorage = new NodeCache({ stdTTL: 60 * 60, useClones: false });

function getSessionById(sessionId: string): BasicSession {
  const session = sessionStorage.get(sessionId);
  if (!session) {
    throw new Error(`Unknown or expired session ${sessionId}`);
  }
  return session as BasicSession;
}

function getBasicSession(request: Request): BasicSession {
  const sessionId = request.get(sessionHeader);

  if (!sessionId) {
    throw new Error(`Required header ${sessionHeader} is missing`);
  }

  return getSessionById(sessionId);
}

function getSession(request: Request): Session {
  const session = getBasicSession(request);

  const { did, didConfirmed, encryptionKeyUri } = session;
  if (!did || !didConfirmed || !encryptionKeyUri) {
    throw new Error('Unconfirmed DID');
  }

  return { ...session, did, encryptionKeyUri };
}

export function setSession(session: BasicSession): void {
  sessionStorage.set(session.sessionId, session);
}

export function basicSessionMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  try {
    const session = getBasicSession(request);
    (request as Request & { session: BasicSession }).session = session;
    next();
  } catch (error) {
    response.status(StatusCodes.FORBIDDEN).send(error);
  }
}

export function sessionMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  try {
    const session = getSession(request);
    (request as Request & { session: Session }).session = session;
    next();
  } catch (error) {
    response.status(StatusCodes.FORBIDDEN).send(error);
  }
}
