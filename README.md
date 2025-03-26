# sync-env
![](https://img.shields.io/github/stars/titenq/sync-env.svg) ![](https://img.shields.io/github/forks/titenq/sync-env.svg) ![](https://img.shields.io/github/issues/titenq/sync-env.svg)

#### O **sync-env** é uma ferramenta CLI que sincroniza automaticamente todos os arquivos `.env` com um repositório privado no GitHub, mantendo suas variáveis de ambiente seguras e versionadas.

## ✨ Funcionalidades

- 🔒 Sincroniza todos os arquivos `.env` com um repositório privado
- 🔄 Mantém histórico de alterações
- 🏷️ Nomeia os arquivos remotos automaticamente (ex: `envs/.meu-projeto.env` ou `envs/.meu-projeto.local.env`)
- ⚡ Cria/atualiza todos os arquivos `.env.example` automaticamente

## 🚀 Instalação

### 1. Criar um repositório privado no GitHub para armazenar seus arquivos `.env`

### 2. Criar Token de Acesso no GitHub
1. Acesse [https://github.com/settings/tokens/new](https://github.com/settings/tokens/new)
2. Clique em "Generate new token"
3. Selecione escopo `repo` (acesso completo a repositórios)
4. Copie o token gerado (você não poderá vê-lo novamente)

### 3. Clonar o sync-env
```bash
git clone https://github.com/titenq/sync-env.git
cd sync-env
```

#### Crie um arquivo `.env` na raiz do projeto com o código abaixo:
```bash
GITHUB_USER=nome-do-seu-usuario-no-github
GITHUB_REPO=nome-do-repositorio-privado
GITHUB_TOKEN=token-github
```

### Instalação global
```bash
npm install
npm run build
npm link
```

## 🛠 Como Usar
#### É só executar o comando abaixo na raiz de qualquer projeto que tenha .env:
```bash
sync-env
```

## ⚙️ Estrutura do Repositório
```
envs/
├── .projeto1.env
├── .projeto2.local.env
└── .projeto3.env
```
