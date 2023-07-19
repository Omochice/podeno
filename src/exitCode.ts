/** Exit code for terminal */
export const ExitCode = {
  Success: 0,
  Failure: 1,
} as const;
export type ExitCode = typeof ExitCode[keyof typeof ExitCode];
