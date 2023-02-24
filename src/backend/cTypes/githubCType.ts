import type { ICType } from '@kiltprotocol/sdk-js';

export const githubCType: ICType = {
  $schema: 'http://kilt-protocol.org/draft-01/ctype#',
  title: 'GitHub',
  properties: {
    Username: {
      type: 'string',
    },
    'User ID': {
      type: 'string',
    },
  },
  type: 'object',
  $id: 'kilt:ctype:0xad52bd7a8bd8a52e03181a99d2743e00d0a5e96fdc0182626655fcf0c0a776d0',
};
