import { Command } from "commander";
import { commandWrapper } from "../../helpers/commandWrapper";
import { Cpf } from ".";
import { copy } from "copy-paste/promises";
import { logger } from "../../services/logger";

export default function (program: Command) {
  program
    .command("cpf")
    .description("Gera ou valida um CPF")
    .option("-g, --generate", "Gerar um CPF válido")
    .option("-v, --validate <cpf>", "Validar um CPF informado")
    .option("-d, --digits <digits>", "Digitos verificadores do CPF")
    .option("-c --copy", "Copia o CPF gerado/validado para o clipboard")
    .option("-f --formatted", "Formata o cpf criado")
    .action(
      commandWrapper(async (...args: any) => {
        const { options, output } = new Cpf().handle(args);
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
}
