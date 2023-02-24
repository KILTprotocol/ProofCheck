import { join } from 'node:path';

import { configuration } from '../utilities/configuration';

import { paths } from './paths';

export const home = {
  method: 'GET',
  path: paths.home,
  handler: {
    file: join(configuration.distFolder, 'index.html'),
  },
  options: {
    tags: ['noLogs'],
  },
};
