import type { ICType } from '@kiltprotocol/sdk-js';

export const telegramCType: ICType = {
  $schema: 'http://kilt-protocol.org/draft-01/ctype#',
  title: 'Telegram',
  properties: {
    'First name': {
      type: 'string',
    },
    'Last name': {
      type: 'string',
    },
    Username: {
      type: 'string',
    },
    'User ID': {
      type: 'number',
    },
  },
  type: 'object',
  $id: 'kilt:ctype:0xcef8f3fe5aa7379faea95327942fd77287e1c144e3f53243e55705f11e890a4c',
};
