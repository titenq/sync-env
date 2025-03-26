import { IGitHubError } from '../interfaces/errorInterface.js';

const isGitHubError = (error: unknown): error is IGitHubError => {
  return error instanceof Error && ('status' in error || 'response' in error);
};

export default isGitHubError;
