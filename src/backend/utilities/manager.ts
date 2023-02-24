import { server as hapiServer } from '@hapi/hapi';
import { createManager } from 'exiting';

import { configuration } from './configuration';

const { port } = configuration;

export const server = hapiServer({
  port,
  host: '127.0.0.1',
  uri: configuration.baseUri,
  routes: { security: true },
});

export const manager = createManager(server);
