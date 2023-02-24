import ky from 'ky';

import { CheckSessionInput, GetSessionOutput } from './session';
import { paths } from './paths';
import { sessionHeader } from './sessionHeader';

export async function getSessionValues(): Promise<GetSessionOutput> {
  return ky.get(paths.session).json();
}

export async function checkSession(
  json: CheckSessionInput,
  sessionId: string,
): Promise<void> {
  const headers = { [sessionHeader]: sessionId };
  await ky.post(paths.session, { json, headers });
}
