import { readdirSync } from 'node:fs';

const getEnvFiles = (projectDir: string) => {
  const allFiles = readdirSync(projectDir);

  return allFiles.filter(file =>
    file.startsWith('.env') &&
    !file.endsWith('.example')
  );
};

export default getEnvFiles;
