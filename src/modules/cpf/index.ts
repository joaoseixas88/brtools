import { ValidationException } from '../../exceptions/Validation';
import { isStdinSentinel, readStdinLines } from '../../helpers/stdin';
import { CliModule } from '../module';

type CpfOptions = {
  generate?: boolean;
  validate?: string;
  digits?: string;
  formatted?: boolean;
  json?: boolean;
  count?: string;
};

export class Cpf extends CliModule {
  private getOptions(options: Record<string, unknown>): string[] {
    return Object.keys(options);
  }

  validateParams(options: Record<string, unknown>): string {
    const actions = ['generate', 'validate', 'digits'];
    const optionKeys = this.getOptions(options);
    const selectedActions = actions.filter((ac) => optionKeys.includes(ac));
    if (selectedActions.length > 1) {
      throw new ValidationException(
        'Você deve escolher exatamente uma das opções: --generate, --validate <cpf> ou --digits <000.000.000>',
      );
    }
    const action = selectedActions[0] ?? 'generate';
    return action;
  }

  override async perform(options: CpfOptions): Promise<string> {
    const action = this.validateParams(options);

    if (action !== 'generate' && options.count !== undefined) {
      throw new ValidationException('--count só se aplica à geração de CPF');
    }

    if (action === 'validate') {
      return this.runValidate(options);
    }

    if (action === 'digits') {
      return this.runDigits(options);
    }

    const cpf = this.generate(options);
    return options.json ? JSON.stringify({ cpf }) : cpf;
  }

  private label(isValid: boolean) {
    return isValid ? '✅ CPF válido' : '❌ CPF inválido';
  }

  private async resolveInputs(value: string, emptyMessage: string) {
    if (!isStdinSentinel(value)) {
      return [value];
    }

    const lines = await readStdinLines();

    if (!lines.length) {
      throw new ValidationException(emptyMessage);
    }

    return lines;
  }

  private async runValidate(options: CpfOptions) {
    const documents = await this.resolveInputs(options.validate, 'Nenhum CPF recebido pelo stdin');
    const results = documents.map((document) => ({ document, valid: this.validate(document) }));

    if (results.some((result) => !result.valid)) {
      this.markInvalid();
    }

    if (options.json) {
      return JSON.stringify(results.length === 1 ? results[0] : results);
    }

    if (results.length === 1) {
      return this.label(results[0].valid);
    }

    return results.map((result) => `${result.document}  ${this.label(result.valid)}`).join('\n');
  }

  private async runDigits(options: CpfOptions) {
    const bases = await this.resolveInputs(options.digits, 'Nenhum número recebido pelo stdin');
    const results = bases.map((base) => ({ base, digits: this.digits(base) }));

    if (options.json) {
      return JSON.stringify(results.length === 1 ? results[0] : results);
    }

    if (results.length === 1) {
      return `Dígitos verificadores: ${results[0].digits}`;
    }

    return results.map((result) => `${result.base}  ${result.digits}`).join('\n');
  }

  private calculateWeightedSum(base: string, length: number): number {
    return base.split('').reduce((acc, previous, index) => {
      const multi = Number(previous) * (length - index);
      acc += multi;
      return acc;
    }, 0);
  }

  private verifyFirstDigit(baseNumbers: string) {
    const total = this.calculateWeightedSum(baseNumbers, 10);
    const rest = total % 11;
    const firstDigit = rest <= 1 ? 0 : 11 - rest;
    return firstDigit;
  }

  private verifySecondDigit(baseNumbers: string, firstVeririedNumber: string) {
    const total = this.calculateWeightedSum(`${baseNumbers}${firstVeririedNumber}`, 11);
    const rest = total % 11;
    const secondDigit = rest <= 1 ? 0 : 11 - rest;
    return secondDigit;
  }

  generate(options) {
    const baseNumbers = Math.floor(Math.random() * 1_000_000_000)
      .toString()
      .padStart(9, '0');
    const firstDigit = this.verifyFirstDigit(baseNumbers);
    const secondDigit = this.verifySecondDigit(baseNumbers, firstDigit.toString());
    const cpf = `${baseNumbers}${firstDigit}${secondDigit}`;
    if (options?.formatted) {
      return this.formatCpf(cpf);
    }
    return cpf;
  }

  digits(baseNumbers: string) {
    const firstDigit = this.verifyFirstDigit(baseNumbers.toString());
    const secondDigit = this.verifySecondDigit(baseNumbers, firstDigit.toString());
    return `${firstDigit}${secondDigit}`;
  }

  validate(cpf: string): boolean {
    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) {
      return false;
    }
    const baseNumbers = cleanCpf.substring(0, 9);
    const checkDigits = cleanCpf.substring(9, 11);

    const firstDigit = this.verifyFirstDigit(baseNumbers);
    const secondDigit = this.verifySecondDigit(baseNumbers, firstDigit.toString());

    return checkDigits === `${firstDigit}${secondDigit}`;
  }

  private formatCpf(cpf: string): string {
    return cpf
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
}
