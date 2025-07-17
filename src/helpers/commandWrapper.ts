import { logger } from '../services/logger';

const commandWrapper =
  (fn: (...args: any[]) => Promise<void>) =>
  async (...args: any[]) => {
    try {
      await fn(...args);
    } catch (error) {
      if (error.name === 'ValidationException') {
        logger.error(error.message);
        return;
      } else {
        console.error('Erro inesperado:', error);
      }
    } finally {
      process.exit(0);
    }
  };

export { commandWrapper };
