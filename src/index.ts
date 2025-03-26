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
    const envFiles = ['.env.local', '.env'];
    let localEnvPath = '';
    let envType = '';

    for (const file of envFiles) {
      const fullPath = join(projectDir, file);
      
      if (existsSync(fullPath)) {
        localEnvPath = fullPath;
        envType = file;

        break;
      }
    }

    if (!localEnvPath) {
      throw new Error(`Nenhum arquivo .env ou .env.local encontrado em ${projectDir}`);
    }

    const remoteFilePath = `envs/.${projectName}${envType.replace('.env', '')}.env`;

    console.log('🔍 Verificando configuração:');
    console.log('Arquivo local:', basename(localEnvPath));
    console.log('Usuário:', config.GITHUB_USER);
    console.log('Repositório:', config.GITHUB_REPO);
    console.log('Caminho remoto:', remoteFilePath);

    const envContent = await readFile(localEnvPath, 'utf-8');
    const octokit = new Octokit({ auth: config.GITHUB_TOKEN });
    let sha: string | undefined;

    try {
      const { data } = await octokit.rest.repos.getContent({
        owner: config.GITHUB_USER,
        repo: config.GITHUB_REPO,
        path: remoteFilePath,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });

      if ('sha' in data) {
        sha = data.sha;
      };
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

    console.log(`✅ ${envType} sincronizado com sucesso!`);
    console.log(`📁 Repositório: ${config.GITHUB_USER}/${config.GITHUB_REPO}`);
    console.log(`📍 Caminho remoto: ${remoteFilePath}`);

    const exampleFileName = `${envType}.example`;
    const examplePath = join(projectDir, exampleFileName);

    await updateEnvExample(envContent, examplePath);
  } catch (error) {
    console.error('❌ Sync failed:');
    console.error(error);

    process.exit(1);
  }
};

syncEnv();
