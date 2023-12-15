export function toError(message = "Unknown Error"): (e: unknown) => Error {
  return (e: unknown) => {
    if (e instanceof Error) {
      return e;
    }
    return new Error(message, { cause: e });
  };
}
