import { Claim, Credential } from '@kiltprotocol/sdk-js';
import { constants } from '@kiltprotocol/vc-export';
import { configuration } from './configuration';
import { domainLinkageCType } from '../cTypes/domainLinkageCType';
import { signWithAssertionMethod } from './cryptoCallbacks';
const {
  DEFAULT_VERIFIABLECREDENTIAL_CONTEXT,
  DEFAULT_VERIFIABLECREDENTIAL_TYPE,
  KILT_SELF_SIGNED_PROOF_TYPE,
  KILT_VERIFIABLECREDENTIAL_TYPE,
} = constants;
const context = [
  DEFAULT_VERIFIABLECREDENTIAL_CONTEXT,
  'https://identity.foundation/.well-known/did-configuration/v1',
];
const TTL = 1000 * 60 * 60 * 24 * 365 * 5; // 5 years
export async function attestDomainLinkage() {
  const claimContents = {
    id: configuration.did,
    origin: configuration.baseUri,
  };
  const claim = Claim.fromCTypeAndClaimContents(
    domainLinkageCType,
    claimContents,
    configuration.did,
  );
  const credential = Credential.fromClaim(claim);
  return Credential.createPresentation({
    credential,
    // the domain linkage credential is special in that it is signed with the assertionMethod key
    signCallback: signWithAssertionMethod,
  });
}
export function fromCredential(input) {
  const credentialSubject = {
    ...input.claim.contents,
    rootHash: input.rootHash,
  };
  const issuer = input.claim.owner;
  const issuanceDate = new Date().toISOString();
  const expirationDate = new Date(Date.now() + TTL).toISOString();
  const { claimerSignature } = input;
  // add self-signed proof
  const proof = {
    type: KILT_SELF_SIGNED_PROOF_TYPE,
    proofPurpose: 'assertionMethod',
    verificationMethod: claimerSignature.keyUri,
    signature: claimerSignature.signature,
    challenge: claimerSignature.challenge,
  };
  return {
    '@context': context,
    issuer,
    issuanceDate,
    expirationDate,
    type: [
      DEFAULT_VERIFIABLECREDENTIAL_TYPE,
      'DomainLinkageCredential',
      KILT_VERIFIABLECREDENTIAL_TYPE,
    ],
    credentialSubject,
    proof,
  };
}
