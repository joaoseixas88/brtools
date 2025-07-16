import { ValidationException } from "../../exceptions/Validation";
import { NumbersHelper } from "../../helpers/numbers";
import { CliModule } from "../module";

export class CnpjModule extends CliModule {
  validateParams(options: Record<string, any>): string {
    const actions = ["generate", "validate", "digits"];
    const selectedActions = actions.filter((a) => options[a]);
    if (selectedActions.length > 1) {
      throw new ValidationException(
        "Você deve escolher exatamente uma das opções: --generate, --validate <cnpj> ou --digits <00.000.000/0000-00>"
      );
    }
    const action = selectedActions[0] ?? "generate";
    return action;
  }
  handle(options: any): CliModule.Result {
    const action = this.validateParams(options);
    const result = {
      generate: () => this.generate(options),
      validate: () => {
        const isValid = this.validate(options.validate);
        return isValid ? "✅ CNPJ válido" : "❌ CNPJ inválido";
      },
      digits: () => {
        return this.digits(options.digits);
      },
    }[action]!();
    return {
      output: result,
      options,
    };
  }

  private checkSum(base: string, start: number) {
    const sum = base.split("").reduce((acc, val) => {
      if (start < 2) {
        start = 9;
      }
      acc += start * Number(val);
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

  generate(options?: Record<string, any>) {
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
    cnpj = NumbersHelper.onlyNumbers(cnpj);
    if (cnpj.length > 14) return false;
    if (cnpj.length < 14) {
      cnpj = cnpj.padStart(14, "0");
    }
    const base = cnpj.slice(0, 12);
    const firstDigit = this.verifyDigit(base);
    const secondDigit = this.verifyDigit(`${base}${firstDigit}`);
    return (
      firstDigit.toString() === cnpj[12] && secondDigit.toString() === cnpj[13]
    );
  }

  digits(base: string) {
    base = NumbersHelper.onlyNumbers(base);
    if (base.length !== 12) {
      throw new ValidationException("Números base inválidos");
    }
    const firstDigit = this.verifyDigit(base);
    const secondDigit = this.verifyDigit(`${base}${firstDigit}`);
    return `Digitaos verificadores: ${firstDigit}${secondDigit}`;
  }

  private format(cnpj: string) {
    return cnpj
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
}
