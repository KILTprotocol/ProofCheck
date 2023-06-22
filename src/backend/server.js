import express from 'express';
import bodyParser from 'body-parser';
import { didDocumentPromise } from './utilities/didDocument';
import { configuration } from './utilities/configuration';
import { logger } from './utilities/logger';
import { session } from './endpoints/session';
import { requestCredential } from './endpoints/requestCredential';
import { verify } from './endpoints/verify';
import { staticFiles } from './endpoints/staticFiles';
(async () => {
  await didDocumentPromise;
  logger.info('Blockchain connection initialized');
  const app = express();
  app.use(bodyParser.json());
  app.use(session);
  app.use(requestCredential);
  app.use(verify);
  app.use(staticFiles);
  logger.info('Routes configured');
  const host = '0.0.0.0';
  const { port, baseUri } = configuration;
  const started = app.listen(port, host, () =>
    logger.info(`Listening on ${baseUri} (host: ${host}, port: ${port})`),
  );
  function stop() {
    started.close();
    process.exit(1);
  }
  process.on('unhandledRejection', stop);
  process.on('uncaughtException', stop);
})();
