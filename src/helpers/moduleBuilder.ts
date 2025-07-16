export const makeModule = <T extends { handle: (...args: any[]) => any }>(
  Module: new () => T
) => {
  const instance = new Module();
  return instance.handle.bind(instance);
};
