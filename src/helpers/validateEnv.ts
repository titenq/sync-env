import { ISyncConfig } from '../interfaces/envSyncInterface.js';

const validateEnv = (): ISyncConfig => {
  const { GITHUB_USER, GITHUB_REPO, GITHUB_TOKEN } = process.env;

  if (!GITHUB_USER || !GITHUB_REPO || !GITHUB_TOKEN) {
    throw new Error(`
      Variáveis ausentes no .env do sync-env:
      GITHUB_USER: ${GITHUB_USER ? 'OK' : 'FALTANDO'}
      GITHUB_REPO: ${GITHUB_REPO ? 'OK' : 'FALTANDO'}
      GITHUB_TOKEN: ${GITHUB_TOKEN ? '***' : 'FALTANDO'}
    `);
  }

  return { GITHUB_USER, GITHUB_REPO, GITHUB_TOKEN };
};

export default validateEnv;
