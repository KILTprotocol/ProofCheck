import ky from 'ky';
import { paths } from './paths';
import { sessionHeader } from './sessionHeader';
export async function getSessionValues() {
  return ky.get(paths.session).json();
}
export async function checkSession(json, sessionId) {
  const headers = { [sessionHeader]: sessionId };
  await ky.post(paths.session, { json, headers });
}
