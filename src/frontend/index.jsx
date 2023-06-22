import { Fragment, useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import ky from 'ky';
import {
  socialCTypeIds,
  supportedCTypes,
} from '../backend/utilities/supportedCType';
import { sessionHeader } from '../backend/endpoints/sessionHeader';
import { paths } from '../backend/endpoints/paths';
import {
  apiWindow,
  getCompatibleExtensions,
  getSession,
} from './utilities/session';
import { exceptionToError } from './utilities/exceptionToError';
const cTypes = Object.fromEntries(
  Object.values(supportedCTypes).map(({ title, $id }) => [
    $id.replace('kilt:ctype:', ''),
    title,
  ]),
);
function App() {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState();
  const [presentation, setPresentation] = useState();
  const [attester, setAttester] = useState();
  const [revoked, setRevoked] = useState();
  const [isAttested, setIsAttested] = useState(false);
  const { kilt } = apiWindow;
  const [extensions, setExtensions] = useState(getCompatibleExtensions());
  useEffect(() => {
    function handler() {
      setExtensions(getCompatibleExtensions());
    }
    window.dispatchEvent(new CustomEvent('kilt-dapp#initialized'));
    window.addEventListener('kilt-extension#initialized', handler);
    return () =>
      window.removeEventListener('kilt-extension#initialized', handler);
  }, []);
  const handleClick = useCallback(
    async (extension) => {
      try {
        setPresentation(undefined);
        setProcessing(true);
        setError(undefined);
        const session = await getSession(kilt[extension]);
        setProcessing(false);
        const { sessionId } = session;
        const headers = { [sessionHeader]: sessionId };
        // define in advance how to handle the response from the extension
        await session.listen(async (message) => {
          const result = await ky
            .post(paths.verify, { headers, json: message })
            .json();
          setPresentation(result.presentation);
          setAttester(result.attester);
          setRevoked(result.revoked);
          setIsAttested(result.isAttested);
        });
        // encrypt message on the backend
        const message = await ky
          .post(paths.requestCredential, { headers, json: socialCTypeIds })
          .json();
        // forward the encrypted message to the extension
        await session.send(message);
      } catch (exception) {
        const { message } = exceptionToError(exception);
        if (message.includes('closed') || message.includes('Rejected')) {
          setError('closed');
        } else if (message.includes('Not authorized')) {
          setError('rejected');
        } else {
          setError('unknown');
          console.error(exception);
        }
        setProcessing(false);
      }
    },
    [kilt],
  );
  const contents = presentation && Object.entries(presentation.claim.contents);
  return (
    <section>
      <h1>ProofCheck</h1>

      <p>
        This KILT Verifier Example accepts credentials issued by SocialKYC for
        the following social networks: Discord, Telegram, Twitter, Twitch,
        YouTube. <br />
        Other credentials will not be shown in Sporran.
      </p>

      {extensions.length === 0 && (
        <p>
          Looking for a wallet… You need to have e.g. Sporran wallet installed
          and have an identity configured in it.
        </p>
      )}

      {extensions.map((extension) => (
        <button
          key={extension}
          onClick={() => handleClick(extension)}
          type="button"
        >
          Verify social credentials from {kilt[extension].name}
        </button>
      ))}

      {processing && <p>Connecting…</p>}

      {presentation && !isAttested && revoked && (
        <h3>❌ You’ve shared a revoked credential</h3>
      )}

      {presentation && !isAttested && !revoked && (
        <h3>❓ You’ve shared a not yet attested credential</h3>
      )}

      {presentation && isAttested && (
        <section>
          <h3>
            Your social credential for {cTypes[presentation.claim.cTypeHash]} is
            verified ✅
          </h3>
          <p>❤️ Now like and subscribe! ❤️</p>
        </section>
      )}

      {presentation && isAttested && (
        <details>
          <summary>Credential details 🔍</summary>

          <h4>Attester:</h4>
          <p>SocialKYC ✅ ({attester})</p>

          <h4>Your DID:</h4>
          <p>✅ {presentation.claim.owner}</p>

          <h4>Content:</h4>
          <dl>
            {contents?.map(([label, value]) => (
              <Fragment key={label}>
                <dt>{label}</dt>
                <dd>{String(value)}</dd>
              </Fragment>
            ))}
          </dl>
          {contents?.length === 0 && <p>Contents not disclosed</p>}
        </details>
      )}

      {error === 'unknown' && (
        <p>
          Something went wrong! Try again or reload the page or restart your
          browser.
        </p>
      )}

      {error === 'closed' && <p>Your wallet was closed. Please try again.</p>}

      {error === 'rejected' && (
        <p>
          The authorization was rejected. Follow the instructions on our Tech
          Support site to establish the connection between this verifier and
          your wallet.
        </p>
      )}

      {error === 'rejected' && (
        <a
          href="https://support.kilt.io/support/solutions/articles/80000968082-how-to-grant-access-to-website"
          target="_blank"
          rel="noreferrer"
        >
          Tech Support
        </a>
      )}
    </section>
  );
}
const root = createRoot(document.querySelector('#app'));
root.render(<App />);
