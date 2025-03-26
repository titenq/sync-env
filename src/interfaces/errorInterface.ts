export interface IGitHubError extends Error {
  status?: number;
  documentation_url?: string;
  response?: {
    data: {
      message?: string;
      documentation_url?: string;
    };
  };
}

export interface ISystemError extends Error {
  code?: string;
  errno?: number;
  syscall?: string;
  path?: string;
}
