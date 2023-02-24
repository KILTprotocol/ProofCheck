import inert from '@hapi/inert';
import pino from 'hapi-pino';

import { didDocumentPromise } from './utilities/didDocument';
import { manager, server } from './utilities/manager';
import { exitOnError } from './utilities/exitOnError';

import { wellKnownDidConfig } from './didConfiguration/wellKnownDidConfig';

import { requestCredential } from './endpoints/requestCredential';
import { verify } from './endpoints/verify';

import { session } from './endpoints/session';

import { staticFiles } from './endpoints/staticFiles';

import { home } from './endpoints/home';
import { initKilt } from './utilities/initKilt';

const logger = {
  plugin: pino,
  options: {
    transport: { target: 'pino-pretty' },
    ignoreTags: ['noLogs'],
    level: 'trace',
    redact: { paths: ['req', 'res'], remove: true },
  },
};

(async () => {
  await server.register(inert);
  await server.register(logger);
  server.logger.info('Server configured');

  await initKilt();
  await didDocumentPromise;
  server.logger.info('Blockchain connection initialized');

  server.route(wellKnownDidConfig);

  server.route(session);
  server.route(requestCredential);
  server.route(verify);

  server.route(home);
  server.route(staticFiles);

  server.logger.info('Routes configured');

  await manager.start();
})().catch(exitOnError);
