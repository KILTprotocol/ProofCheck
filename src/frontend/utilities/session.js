import {
  checkSession,
  getSessionValues,
} from '../../backend/endpoints/sessionApi';
export const apiWindow = window;
export function getCompatibleExtensions() {
  return Object.entries(apiWindow.kilt)
    .filter(([, provider]) => provider.specVersion.startsWith('3.'))
    .map(([name]) => name);
}
export async function getSession(provider) {
  if (!provider) {
    throw new Error('No provider');
  }
  const { dAppEncryptionKeyUri, challenge, sessionId } =
    await getSessionValues();
  const dAppName = 'ProofCheck';
  const session = await provider.startSession(
    dAppName,
    dAppEncryptionKeyUri,
    challenge,
  );
  const { encryptionKeyUri, encryptedChallenge, nonce } = session;
  await checkSession(
    {
      encryptionKeyUri,
      encryptedChallenge,
      nonce,
    },
    sessionId,
  );
  const { name } = provider;
  return { ...session, sessionId, name };
}
