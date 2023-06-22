import { StatusCodes } from 'http-status-codes';
import NodeCache from 'node-cache';
import { sessionHeader } from '../endpoints/sessionHeader';
const sessionStorage = new NodeCache({ stdTTL: 60 * 60, useClones: false });
function getSessionById(sessionId) {
  const session = sessionStorage.get(sessionId);
  if (!session) {
    throw new Error(`Unknown or expired session ${sessionId}`);
  }
  return session;
}
function getBasicSession(request) {
  const sessionId = request.get(sessionHeader);
  if (!sessionId) {
    throw new Error(`Required header ${sessionHeader} is missing`);
  }
  return getSessionById(sessionId);
}
function getSession(request) {
  const session = getBasicSession(request);
  const { did, didConfirmed, encryptionKeyUri } = session;
  if (!did || !didConfirmed || !encryptionKeyUri) {
    throw new Error('Unconfirmed DID');
  }
  return { ...session, did, encryptionKeyUri };
}
export function setSession(session) {
  sessionStorage.set(session.sessionId, session);
}
export function basicSessionMiddleware(request, response, next) {
  try {
    const session = getBasicSession(request);
    request.session = session;
    next();
  } catch (error) {
    response.status(StatusCodes.FORBIDDEN).send(error);
  }
}
export function sessionMiddleware(request, response, next) {
  try {
    const session = getSession(request);
    request.session = session;
    next();
  } catch (error) {
    response.status(StatusCodes.FORBIDDEN).send(error);
  }
}
