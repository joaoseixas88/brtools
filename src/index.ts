#!/usr/bin/env node

import { program } from "commander";
import { version, name, description } from "../package.json";
import { Cpf } from "./modules/cpf";
import { copy } from "copy-paste/promises";

const commandWrapper = (fn: (options: any) => Promise<void>) => async (
  options: any
) => {
  try {
    fn(options);
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
        await copy(output);
        console.log(`${output}  ✅ Copiado para a área de transferência`);
      } else {
        console.log(output);
      }
    })
  );

program.parse(process.argv);
