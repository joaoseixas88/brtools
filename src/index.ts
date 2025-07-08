#!/usr/bin/env node

import { program } from "commander";
import { version, name, description } from "../package.json";
import clipboard from "clipboardy";
import { Cpf } from "./modules/cpf";
import { ValidationException } from "./exceptions/Validation";

const commandWrapper = (fn: (options: any) => void) => (options: any) => {
  try {
    fn(options);
  } catch (error) {
    if (error instanceof ValidationException) {
      console.log(error.message);
    } else {
      console.error("Erro inesperado:", error);
    }
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
  .action(
    commandWrapper((options) => {
      const output = new Cpf().handle(options);
      if (options.copy) {
        clipboard.writeSync(output);
        console.log(`${output}  ✅ Copiado para a área de transferência`);
      } else {
        console.log(output);
      }
    })
  );

program.parse(process.argv);
