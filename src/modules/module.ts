import { copy } from 'copy-paste/promises';
import { logger } from '../services/logger';
import fs from 'fs';
import path from 'path';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

export class NewModule {
  async perform(...args: unknown[]): Promise<string> {
    return (args?.[0] as string) ?? '';
  }

  async handle(...args: unknown[]) {
    try {
      const outputStr = await this.perform(...args);
      const shouldCopy = args.some((v) => typeof v === 'object' && v['copy'] !== undefined);

      const isLarge = outputStr.length > 10_000;

      if (isLarge) {
        logger.warn(`⚠️   O resultado gerado é muito grande (${outputStr.length} caracteres).`);
        const rl = readline.createInterface({ input, output });
        const answer = await rl.question(
          'Deseja salvar em um arquivo .txt em vez de copiar? (s/N): ',
        );
        rl.close();

        if (answer.trim().toLowerCase() === 's') {
          const filePath = path.resolve(process.cwd(), `output-${Date.now()}.txt`);
          fs.writeFileSync(filePath, outputStr, 'utf8');
          logger.info(`✅ Salvo em arquivo: ${filePath}`);
          return;
        }
      }

      if (shouldCopy) {
        await copy(outputStr)
          .then(() => {
            logger.info(
              `${isLarge ? '[parcial] ' : outputStr}  ✅Copiado para a área de transferência`,
            );
          })
          .catch((err) => {
            if (err.path === 'xclip') {
              logger.error('Erro ao copiar para a área de transferência');
              logger.warn(
                'xclip não encontrado: necessário para copiar no Linux. Instale com: sudo apt install xclip',
              );
              logger.info(outputStr);
            }
          });
      } else {
        logger.info(outputStr);
      }
    } catch (error) {
      if (error?.name === 'ValidationException') {
        logger.error(error.message);
        return;
      } else {
        console.error('Erro inesperado:', error);
      }
    } finally {
      if (process.env.NODE_ENV !== 'test') {
        process.exit(0);
      }
    }
  }
}

export namespace NewModule {
  export type Result = {
    output: string;
    options: Record<string, unknown>;
  };
}
