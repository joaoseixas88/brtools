import { copy } from 'copy-paste/promises';
import { logger } from '../services/logger';
import { ValidationException } from '../exceptions/Validation';
import fs from 'fs';
import path from 'path';
import readline from 'readline/promises';
import { stdin as input, stderr } from 'process';

const maxCount = 10_000;
const uniqueAttemptsPerItem = 50;

export const EXIT_OK = 0;
export const EXIT_INVALID = 1;
export const EXIT_ERROR = 2;

export class CliModule {
  protected exitCode = EXIT_OK;

  async perform(...args: unknown[]): Promise<string> {
    return (args?.[0] as string) ?? '';
  }

  protected markInvalid() {
    this.exitCode = EXIT_INVALID;
  }

  private isPlainObject(value: unknown): value is Record<string, unknown> {
    return (
      typeof value === 'object' &&
      value !== null &&
      Object.getPrototypeOf(value) === Object.prototype
    );
  }

  private findOptions(args: unknown[]): Record<string, unknown> | undefined {
    return args.find((arg) => this.isPlainObject(arg)) as Record<string, unknown> | undefined;
  }

  private resolveCount(options?: Record<string, unknown>) {
    if (options?.count === undefined) {
      return 1;
    }

    const count = Number(options.count);

    if (!Number.isInteger(count) || count < 1) {
      throw new ValidationException('--count deve ser um número inteiro maior que zero');
    }

    if (count > maxCount) {
      throw new ValidationException(`--count aceita no máximo ${maxCount}`);
    }

    return count;
  }

  private withoutJson(args: unknown[]) {
    return args.map((arg) => {
      if (!this.isPlainObject(arg)) {
        return arg;
      }

      const rest = { ...arg };
      delete rest.json;

      return rest;
    });
  }

  private async performMany(count: number, args: unknown[], asJson: boolean) {
    const rawArgs = this.withoutJson(args);
    const values = new Set<string>();
    const maxAttempts = count * uniqueAttemptsPerItem;
    let attempts = 0;

    while (values.size < count && attempts < maxAttempts) {
      values.add(await this.perform(...rawArgs));
      attempts++;
    }

    if (values.size < count) {
      throw new ValidationException(
        `Não foi possível gerar ${count} valores únicos. Máximo alcançado: ${values.size}`,
      );
    }

    const items = [...values];

    return asJson ? JSON.stringify(items) : items.join('\n');
  }

  async handle(...args: unknown[]) {
    try {
      const options = this.findOptions(args);
      const count = this.resolveCount(options);
      const outputStr =
        count > 1
          ? await this.performMany(count, args, Boolean(options?.json))
          : await this.perform(...args);
      const shouldCopy = options?.copy !== undefined;

      const isLarge = outputStr.length > 10_000 && process.stdin.isTTY && process.stdout.isTTY;

      if (isLarge) {
        logger.warn(`⚠️   O resultado gerado é muito grande (${outputStr.length} caracteres).`);
        const rl = readline.createInterface({ input, output: stderr });
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
          .then(async () => {
            if (isLarge) {
              logger.info('[parcial] ✅ Copiado para a área de transferência');
              return;
            }
            await logger.result(outputStr);
            logger.info('✅ Copiado para a área de transferência');
          })
          .catch(async (err) => {
            if (err.path === 'xclip') {
              logger.error('Erro ao copiar para a área de transferência');
              logger.warn(
                'xclip não encontrado: necessário para copiar no Linux. Instale com: sudo apt install xclip',
              );
              await logger.result(outputStr);
            }
          });
      } else {
        await logger.result(outputStr);
      }
    } catch (error) {
      this.exitCode = EXIT_ERROR;

      if (error?.name === 'ValidationException') {
        logger.error(error.message);
        return;
      } else {
        console.error('Erro inesperado:', error);
      }
    } finally {
      if (process.env.NODE_ENV !== 'test') {
        process.exit(this.exitCode);
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
