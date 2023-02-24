import express, { Router } from 'express';

import { configuration } from '../utilities/configuration';

export const staticFiles = Router();

staticFiles.use(
  // eslint-disable-next-line import/no-named-as-default-member
  express.static(configuration.distFolder, {
    dotfiles: 'allow',
    setHeaders(res) {
      res.set('Access-Control-Allow-Origin', '*');
    },
  }),
);
