import { ValidationException } from "../../exceptions/Validation";
import { CliModule } from "../module";

export class Cpf extends CliModule {
  validateParams(options: Record<string, any>): string {
    const actions = ["generate", "validate", "digits"];
    const selectedActions = actions.filter((a) => options[a]);
    if (selectedActions.length > 1) {
      throw new ValidationException(
        "Você deve escolher exatamente uma das opções: --generate, --validate <cpf> ou --digits <000.000.000>"
      );
    }
    const action = selectedActions[0] ?? "generate";
    return action;
  }

  handle(options: Record<string, any>): CliModule.Result {
    const action = this.validateParams(options);
    const result = {
      generate: () => this.generate(options),
      validate: () => {
        const isValid = this.validate(options.validate);
        return isValid ? "✅ CPF válido" : "❌ CPF inválido";
      },
      digits: () => {
        return `Dígitos verificadores: ${this.digits(options.digits)}`;
      },
    }[action]!();
    return result;
  }

  private calculateWeightedSum(base: string, length: number): number {
    return base.split("").reduce((acc, previous, index) => {
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
    const total = this.calculateWeightedSum(
      `${baseNumbers}${firstVeririedNumber}`,
      11
    );
    const rest = total % 11;
    const secondDigit = rest <= 1 ? 0 : 11 - rest;
    return secondDigit;
  }

  generate(options) {
    const baseNumbers = Math.floor(Math.random() * 1_000_000_000)
      .toString()
      .padStart(9, "0");
    const firstDigit = this.verifyFirstDigit(baseNumbers);
    const secondDigit = this.verifySecondDigit(
      baseNumbers,
      firstDigit.toString()
    );
    const cpf = `${baseNumbers}${firstDigit}${secondDigit}`;
    if (options?.formatted) {
      return this.formatCpf(cpf);
    }
    return cpf;
  }

  digits(baseNumbers: string) {
    const firstDigit = this.verifyFirstDigit(baseNumbers.toString());
    const secondDigit = this.verifySecondDigit(
      baseNumbers,
      firstDigit.toString()
    );
    return `${firstDigit}${secondDigit}`;
  }

  validate(cpf: string): boolean {
    const cleanCpf = cpf.replace(/\D/g, "");
    if (cleanCpf.length !== 11) {
      return false;
    }
    const baseNumbers = cleanCpf.substring(0, 9);
    const checkDigits = cleanCpf.substring(9, 11);

    const firstDigit = this.verifyFirstDigit(baseNumbers);
    const secondDigit = this.verifySecondDigit(
      baseNumbers,
      firstDigit.toString()
    );

    return checkDigits === `${firstDigit}${secondDigit}`;
  }

  private formatCpf(cpf: string): string {
    return cpf
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
}
