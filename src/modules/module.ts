import { copy } from "copy-paste/promises";
import { logger } from "../services/logger";

// export abstract class CliModule<Type = Record<string, any>> {
//   abstract handle(...args: any[]): CliModule.Result;
//   abstract validateParams(...args: any[]): any;
// }

// export namespace CliModule {
//   export type Result = {
//     output: string;
//     options: Record<string, any>;
//   };
// }

export class NewModule {
  async perform(...args: any): Promise<string> {
    return "";
  }
  async handle(...args: any) {
    try {
      const output = await this.perform(...args);
      const shouldCopy = args.some(
        (v) => typeof v === "object" && v.hasOwnProperty("copy")
      );

      if (shouldCopy) {
        await copy(output)
          .then(() => {
            logger.info(`${output}  ✅ Copiado para a área de transferência`);
          })
          .catch((err) => {
            if (err.path === "xclip") {
              logger.error("Erro ao copiar para a área de transferência");
              logger.warn(
                "xclip não encontrado: necessário para copiar no Linux. Instale com: sudo apt install xclip"
              );
              logger.info(output);
            }
          });
      } else {
        logger.info(output);
      }
    } catch (error) {
      if (error.name === "ValidationException") {
        logger.error(error.message);
        return;
      } else {
        console.error("Erro inesperado:", error);
      }
    } finally {
      if (process.env.NODE_ENV !== "test") {
        process.exit(0);
      }
    }
  }
}

export namespace NewModule {
  export type Result = {
    output: string;
    options: Record<string, any>;
  };
}
