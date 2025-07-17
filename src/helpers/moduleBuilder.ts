export const makeModule = <T extends { handle: (...args: any[]) => any }>(Module: new () => T) => {
  const instance = new Module();
  return async (...args: any[]) => {
    const result = await instance.handle(...args);
    return result;
  };
};
