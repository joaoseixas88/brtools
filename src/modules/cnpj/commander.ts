import { Command } from "commander";
import { commandWrapper } from "../../helpers/commandWrapper";
import { CnpjModule } from ".";
import { copy } from "copy-paste/promises";
import { logger } from "../../services/logger";

export default function (program: Command) {
  program
    .command("cnpj")
    .description("Gera ou valida um CNPJ")
    .option("-g, --generate", "Gerar um CNPJ válido")
    .option("-v, --validate <cnpj>", "Validar um CNPJ informado")
    .option("-d, --digits <digits>", "Digitos verificadores do CNPJ")
    .option("-c --copy", "Copia o CNPJ gerado/validado para o clipboard")
    .option("-f --formatted", "Formata o CNPJ criado")
    .action(
      commandWrapper(async (...args: any) => {
        const { options, output } = new CnpjModule().handle(args);
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
