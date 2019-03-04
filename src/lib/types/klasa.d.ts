import { Settings } from 'klasa';

export type UserSettings = Settings & {
  authorName: string;
  category: string;
  [key: string]: string | null;
};
