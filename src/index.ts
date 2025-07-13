#!/usr/bin/env node

import { program } from "commander";
import { copy } from "copy-paste/promises";
import { description, name, version } from "../package.json";
import { Cpf } from "./modules/cpf";
import { logger } from "./services/logger";

const commandWrapper = (fn: (options: any) => Promise<void>) => async (
  options: any
) => {
  try {
    await fn(options);
  } catch (error) {
    if (error.name === "ValidationException") {
      console.log(error.message);
      return;
    } else {
      console.error("Erro inesperado:", error);
    }
  } finally {
    process.exit(0);
  }
};

program
  .name(name)
  .version(version)
  .description(description || "A CLI tool to help you with your daily tasks");

program
  .command("cpf")
  .description("Gera ou valida um CPF")
  .option("-g, --generate", "Gerar um CPF válido")
  .option("-v, --validate <cpf>", "Validar um CPF informado")
  .option("-d, --digits <digits>", "Digitos verificadores do CPF")
  .option("-c --copy", "Copia o CPF gerado/validado para o clipboard")
  .option("-f --formatted", "Formata o cpf criado")
  .action(
    commandWrapper(async (options) => {
      const output = new Cpf().handle(options);
      if (options.copy) {
        return await copy(output)
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
    })
  );

program.parse(process.argv);
