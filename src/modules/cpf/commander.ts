import { Command } from "commander";
import { commandWrapper } from "../../helpers/commandWrapper";
import { Cpf } from ".";
import { copy } from "copy-paste/promises";
import { logger } from "../../services/logger";
import { makeModule } from "../../helpers/moduleBuilder";

export default function (program: Command) {
  program
    .command("cpf")
    .description("Gera ou valida um CPF")
    .option("-g, --generate", "Gerar um CPF válido")
    .option("-v, --validate <cpf>", "Validar um CPF informado")
    .option("-d, --digits <digits>", "Digitos verificadores do CPF")
    .option("-c --copy", "Copia o CPF gerado/validado para o clipboard")
    .option("-f --formatted", "Formata o cpf criado")
    .action(makeModule(Cpf));
}
