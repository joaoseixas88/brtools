import { AnalyticsService } from '../services/analytics';

export const makeModule = <T extends { handle: (...args: any[]) => any }>(Module: new () => T) => {
  const instance = new Module();
  const analytics = new AnalyticsService();

  return async (...args: any[]) => {
    const startTime = Date.now();
    const commandName = Module.name.replace('Module', '').toLowerCase();

    try {
      const result = await instance.handle(...args);
      const duration = Date.now() - startTime;

      // Rastreia comando executado com sucesso
      await analytics.trackCommand(commandName, args[0] || {}, duration);

      return result;
    } catch (error) {
      // Rastreia erro
      await analytics.trackError(commandName, error.message || 'Erro desconhecido');
      throw error;
    }
  };
};
