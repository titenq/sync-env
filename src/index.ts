#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { cwd } from 'node:process';

import { config } from 'dotenv';
import { Octokit } from '@octokit/rest';

import validateEnv from './helpers/validateEnv.js';
import isGitHubError from './helpers/isGitHubError.js';
import updateEnvExample from './helpers/updateEnvExample.js';
import { ISystemError } from './interfaces/errorInterface.js';
import getEnvFiles from './helpers/getEnvFiles.js';

const loadEnv = () => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const envPath = resolve(__dirname, '.env').replace('/dist', '');

    config({ path: envPath });

    console.log('✅ Configuração carregada de:', envPath);
  } catch (error) {
    console.error('❌ Erro ao carregar configuração:');

    if (error instanceof Error) {
      const systemError = error as ISystemError;

      console.error(`Código: ${systemError.code || 'N/A'}`, `Mensagem: ${systemError.message}`);
    } else {
      console.error('Erro desconhecido:', error);
    }

    process.exit(1);
  }
};

loadEnv();

const syncEnv = async () => {
  try {
    const config = validateEnv();
    const projectDir = cwd();
    const projectName = basename(projectDir);
    const envFiles = getEnvFiles(projectDir);

    if (envFiles.length === 0) {
      throw new Error(`Nenhum arquivo .env* encontrado em ${projectDir}`);
    }

    const octokit = new Octokit({ auth: config.GITHUB_TOKEN });

    for (const envFile of envFiles) {
      try {
        const fullPath = join(projectDir, envFile);

        if (!existsSync(fullPath)) {
          console.warn(`⚠️ ${envFile} não existe, pulando...`);

          continue;
        }

        console.log(`\n🔍 Processando ${envFile}...`);
        
        const remoteFilePath = `envs/.${projectName}${envFile.replace('.env', '')}.env`;
        const envContent = await readFile(fullPath, 'utf-8');
        let sha: string | undefined;

        try {
          const { data } = await octokit.rest.repos.getContent({
            owner: config.GITHUB_USER,
            repo: config.GITHUB_REPO,
            path: remoteFilePath,
            headers: { 'X-GitHub-Api-Version': '2022-11-28' }
          });

          if ('sha' in data) {
            sha = data.sha;
          }
        } catch (error) {
          if (!isGitHubError(error) || error.status !== 404) {
            throw error;
          }
        }

        await octokit.rest.repos.createOrUpdateFileContents({
          owner: config.GITHUB_USER,
          repo: config.GITHUB_REPO,
          path: remoteFilePath,
          message: `sync: ${sha ? 'update' : 'create'} ${remoteFilePath}`,
          content: Buffer.from(envContent).toString('base64'),
          sha
        });

        console.log(`✅ ${envFile} sincronizado!`);
        console.log(`📁 Remoto: ${remoteFilePath}`);

        const exampleFileName = `${envFile}.example`;
        const examplePath = join(projectDir, exampleFileName);

        await updateEnvExample(envContent, examplePath);

        console.log(`📄 ${exampleFileName} atualizado`);
      } catch (error) {
        console.error(`❌ Erro em ${envFile}:`);

        if (isGitHubError(error)) {
          console.error('GitHub:', error.response?.data?.message || error.message);
        } else if (error instanceof Error) {
          console.error(error.message);
        }
      }
    }

    console.log('\n🎉 Todos os arquivos processados com sucesso!');
  } catch (error) {
    console.error('\n❌ Erro geral:');

    if (error instanceof Error) {
      console.error(error.message);
    }
    
    process.exit(1);
  }
};

syncEnv();
