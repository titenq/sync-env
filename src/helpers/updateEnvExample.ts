import { writeFile } from 'node:fs/promises';
import path from 'node:path';

import extractEnvKeys from './extractEnvKeys.js';
import { ISystemError } from '../interfaces/errorInterface.js';

const updateEnvExample = async (envContent: string, examplePath: string) => {
  try {
    const keys = extractEnvKeys(envContent);
    const exampleContent = keys.map(key => `${key}=`).join('\n');

    await writeFile(examplePath, exampleContent);

    console.log(`📋 ${path.basename(examplePath)} sincronizado (${keys.length} variáveis)`);
  } catch (error) {
    const systemError = error as ISystemError;

    console.error(`❌ Falha ao sincronizar exemplo:`);
    console.error(`Erro: ${systemError.code || 'DESCONHECIDO'} - ${systemError.message}`);
  }
};

export default updateEnvExample;
