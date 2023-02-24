import type { ICType } from '@kiltprotocol/sdk-js';

export const domainLinkageCType: ICType = {
  $schema: 'http://kilt-protocol.org/draft-01/ctype#',
  title: 'Domain Linkage Credential',
  properties: {
    id: {
      type: 'string',
    },
    origin: {
      type: 'string',
    },
  },
  type: 'object',
  $id: 'kilt:ctype:0x9d271c790775ee831352291f01c5d04c7979713a5896dcf5e81708184cc5c643',
};
