import { ValidationException } from '../../exceptions/Validation';
import { NumbersHelper } from '../../helpers/numbers';
import { isStdinSentinel, readStdinLines } from '../../helpers/stdin';
import { CliModule } from '../module';

type CnpjOptions = {
  generate?: boolean;
  validate?: string;
  digits?: string;
  formatted?: boolean;
  json?: boolean;
  count?: string;
};

export class CnpjModule extends CliModule {
  private getOptions(options: Record<string, unknown>): string[] {
    return Object.keys(options);
  }
  validateParams(options: Record<string, unknown>): string {
    const actions = ['generate', 'validate', 'digits'];
    const optionKeys = this.getOptions(options);
    const selectedActions = actions.filter((ac) => optionKeys.includes(ac));
    if (selectedActions.length > 1) {
      throw new ValidationException(
        'Você deve escolher exatamente uma das opções: --generate, --validate <cnpj> ou --digits <00.000.000/0000-00>',
      );
    }
    const action = selectedActions[0] ?? 'generate';
    return action;
  }
  override async perform(options: CnpjOptions): Promise<string> {
    const action = this.validateParams(options);

    if (action !== 'generate' && options.count !== undefined) {
      throw new ValidationException('--count só se aplica à geração de CNPJ');
    }

    if (action === 'validate') {
      return this.runValidate(options);
    }

    if (action === 'digits') {
      return this.runDigits(options);
    }

    const cnpj = this.generate(options);
    return options.json ? JSON.stringify({ cnpj }) : cnpj;
  }

  private label(isValid: boolean) {
    return isValid ? '✅ CNPJ válido' : '❌ CNPJ inválido';
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

  private async runValidate(options: CnpjOptions) {
    const documents = await this.resolveInputs(options.validate, 'Nenhum CNPJ recebido pelo stdin');
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

  private async runDigits(options: CnpjOptions) {
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

  private asciiMinus48(val: string) {
    return val.charCodeAt(0) - 48;
  }

  private checkSum(base: string, start: number) {
    const sum = base.split('').reduce((acc, val) => {
      if (start < 2) {
        start = 9;
      }
      acc += start * this.asciiMinus48(val);
      start--;
      return acc;
    }, 0);
    return sum;
  }

  private verifyDigit(base: string) {
    const start = base.length === 12 ? 5 : 6;
    const sum = this.checkSum(base, start);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  }

  generate(options?: { formatted?: boolean }) {
    const baseNumber = NumbersHelper.genRandomNumber(8);
    const base = `${baseNumber}0001`;
    const firstDigit = this.verifyDigit(base);
    const secondDigit = this.verifyDigit(`${base}${firstDigit}`);

    const cnpj = `${base}${firstDigit}${secondDigit}`;
    if (options?.formatted) {
      return this.format(cnpj);
    }
    return cnpj;
  }

  validate(cnpj: string) {
    cnpj = this.cleanup(cnpj);
    if (cnpj.length > 14) return false;
    if (cnpj.length < 14) {
      cnpj = cnpj.padStart(14, '0');
    }
    const base = cnpj.slice(0, 12);
    const firstDigit = this.verifyDigit(base);
    const secondDigit = this.verifyDigit(`${base}${firstDigit}`);
    return firstDigit.toString() === cnpj[12] && secondDigit.toString() === cnpj[13];
  }

  digits(base: string) {
    base = NumbersHelper.onlyNumbers(base);
    if (base.length !== 12) {
      throw new ValidationException('Números base inválidos');
    }
    const firstDigit = this.verifyDigit(base);
    const secondDigit = this.verifyDigit(`${base}${firstDigit}`);
    return `${firstDigit}${secondDigit}`;
  }

  private format(cnpj: string) {
    return cnpj
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }

  private cleanup(cnpj: string) {
    const cnpjRegex = /[^A-Z0-9]/g;
    return cnpj.replace(cnpjRegex, '');
  }
}
