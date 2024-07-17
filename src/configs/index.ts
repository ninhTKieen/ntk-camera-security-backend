import { TAppConfig } from './app.config';
import { TAuthConfig } from './auth.config';
import { TDatabaseConfig } from './database.config';
import { TFirebaseConfig } from './firebase.config';

export type TConfigs = {
  app: TAppConfig;
  auth: TAuthConfig;
  database: TDatabaseConfig;
  firebase: TFirebaseConfig;
};
