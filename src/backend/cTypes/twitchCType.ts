import type { ICType } from '@kiltprotocol/sdk-js';

export const twitchCType: ICType = {
  $schema: 'http://kilt-protocol.org/draft-01/ctype#',
  title: 'Twitch',
  properties: {
    Username: {
      type: 'string',
    },
    'User ID': {
      type: 'string',
    },
  },
  type: 'object',
  $id: 'kilt:ctype:0x568ec5ffd7771c4677a5470771adcdea1ea4d6b566f060dc419ff133a0089d80',
};
