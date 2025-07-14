import { logger } from "../services/logger";

const commandWrapper = (fn: (options: any) => Promise<void>) => async (
  options: any
) => {
  try {
    await fn(options);
  } catch (error) {
    if (error.name === "ValidationException") {
      logger.error(error.message);
      return;
    } else {
      console.error("Erro inesperado:", error);
    }
  } finally {
    process.exit(0);
  }
};

export { commandWrapper };
