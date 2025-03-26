const extractEnvKeys = (content: string): string[] => {
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '')
    .map(line => line.split('=')[0].trim());
};

export default extractEnvKeys;
