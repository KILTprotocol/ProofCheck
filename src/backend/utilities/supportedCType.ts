import type { ICType } from '@kiltprotocol/sdk-js';

import { discordCType } from '../cTypes/discordCType';
import { emailCType } from '../cTypes/emailCType';
import { githubCType } from '../cTypes/githubCType';
import { telegramCType } from '../cTypes/telegramCType';
import { twitchCType } from '../cTypes/twitchCType';
import { twitterCType } from '../cTypes/twitterCType';
import { youtubeCType } from '../cTypes/youtubeCType';

export const supportedCTypeKeys = [
  'discord',
  'email',
  'github',
  'telegram',
  'twitch',
  'twitter',
  'youtube',
] as const;

export type SupportedCType = (typeof supportedCTypeKeys)[number];

export const supportedCTypes: Record<SupportedCType, ICType> = {
  discord: discordCType,
  email: emailCType,
  github: githubCType,
  telegram: telegramCType,
  twitch: twitchCType,
  twitter: twitterCType,
  youtube: youtubeCType,
};

export const socialCTypeIds = [
  supportedCTypes.discord.$id,
  supportedCTypes.telegram.$id,
  supportedCTypes.twitter.$id,
  supportedCTypes.twitch.$id,
  supportedCTypes.youtube.$id,
];
