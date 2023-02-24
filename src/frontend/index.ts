import type { SupportedCType } from '../backend/utilities/supportedCType';

import { requestCredential } from '../backend/endpoints/requestCredentialApi';
import { verifyCredential } from '../backend/endpoints/verifyApi';
import { supportedCTypes } from '../backend/utilities/supportedCType';

import { apiWindow, getSession } from './utilities/session';

const credentialForm = document.getElementById(
  'credential-form',
) as HTMLFormElement;
const shared = document.getElementById('shared') as HTMLElement;

const claimerDid = document.getElementById('claimer-did') as HTMLOutputElement;
const attesterDid = document.getElementById(
  'attester-did',
) as HTMLOutputElement;
const cType = document.getElementById('cType') as HTMLOutputElement;
const status = document.getElementById('status') as HTMLOutputElement;
const json = document.getElementById('json') as HTMLPreElement;
const values = document.getElementById('values') as HTMLPreElement;

const cTypes: Record<string, string> = Object.fromEntries(
  Object.values(supportedCTypes).map(({ title, $id }) => [
    $id.replace('kilt:ctype:', ''),
    title,
  ]),
);

function handleBeforeUnload(event: Event) {
  event.preventDefault();
  event.returnValue = false;
}

async function handleSubmit(event: Event) {
  event.preventDefault();

  window.addEventListener('beforeunload', handleBeforeUnload);

  const target = event.target as unknown as {
    elements: Record<string, HTMLInputElement>;
  };

  const requestedCType = target.elements.ctype.value as SupportedCType;

  try {
    const session = await getSession(apiWindow.kilt.sporran);
    const { sessionId } = session;

    await session.listen(async (message) => {
      try {
        const { presentation, isAttested, attestation } =
          await verifyCredential({ message }, sessionId);

        cType.textContent = cTypes[presentation.claim.cTypeHash] || 'Unknown';

        const entries = Object.entries(presentation.claim.contents);
        if (entries.length > 0) {
          values.textContent = '';
          entries.forEach(([label, value]) => {
            values.appendChild(document.createElement('dt')).textContent =
              label;
            values.appendChild(document.createElement('dd')).textContent =
              value as string;
          });
        } else {
          values.textContent = 'Not disclosed';
        }

        attesterDid.textContent =
          attestation?.owner &&
          [
            'did:kilt:4pehddkhEanexVTTzWAtrrfo2R7xPnePpuiJLC7shQU894aY', // peregrine
            'did:kilt:4pnfkRn5UurBJTW92d9TaVLR2CqJdY4z5HPjrEbpGyBykare', // spiritnet
          ].includes(attestation.owner)
            ? 'SocialKYC ✅'
            : 'Unknown';

        claimerDid.textContent = `✅ ${presentation.claim.owner}`;
        claimerDid.title = presentation.claim.owner;

        if (attestation?.revoked) {
          status.textContent = 'Revoked ❌';
        } else if (isAttested) {
          status.textContent = 'Attested ✅';
        } else {
          status.textContent = 'Not Attested ❓';
        }

        json.textContent = JSON.stringify(presentation, null, 4);

        shared.hidden = false;
      } finally {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      }
    });
    const message = await requestCredential(
      { cType: requestedCType },
      sessionId,
    );

    await session.send(message);
  } catch (error) {
    console.error(error);
    window.removeEventListener('beforeunload', handleBeforeUnload);
  }
}

credentialForm.addEventListener('submit', handleSubmit);
