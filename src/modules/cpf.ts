import { ValidationException } from "../exceptions/Validation";
import { CliModule } from "./module";

export class Cpf extends CliModule {
  handle(options: Record<string, any>): CliModule.Result {
    const actions = ["generate", "validate", "digits"];
    const selectedActions = actions.filter((a) => options[a]);
    if (selectedActions.length !== 1) {
      throw new ValidationException(
        "Você deve escolher exatamente uma das opções: --generate, --validate ou --digits"
      );
    }
    const action = selectedActions[0];
    const result = {
      generate: () => this.generate(),
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

  private verifyFirstDigit(baseNumbers: string) {
    const total = baseNumbers.split("").reduce((acc, previous, index) => {
      const multi = Number(previous) * (10 - index);
      acc += multi;
      return acc;
    }, 0);
    const rest = total % 11;
    let firstDigit = 0;
    if (rest <= 1) {
      firstDigit = 0;
    } else {
      firstDigit = 11 - rest;
    }
    return firstDigit;
  }

  private verifySecondDigit(baseNumbers: string, firstVeririedNumber: number) {
    const total = `${baseNumbers}${firstVeririedNumber}`
      .split("")
      .reduce((acc, previous, index) => {
        const multi = Number(previous) * (11 - index);
        acc += multi;
        return acc;
      }, 0);
    const rest = total % 11;
    let secondDigit = 0;
    if (rest <= 1) {
      secondDigit = 0;
    } else {
      secondDigit = 11 - rest;
    }
    return secondDigit;
  }

  generate() {
    const baseNumbers = Math.floor(Math.random() * 1_000_000_000)
      .toString()
      .padStart(9, "0");
    const firstDigit = this.verifyFirstDigit(baseNumbers);
    const secondDigit = this.verifySecondDigit(baseNumbers, firstDigit);
    return `${baseNumbers}${firstDigit}${secondDigit}`;
  }

  digits(baseNumbers: string) {
    const firstDigit = this.verifyFirstDigit(baseNumbers.toString());
    const secondDigit = this.verifySecondDigit(baseNumbers, firstDigit);
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
    const secondDigit = this.verifySecondDigit(baseNumbers, firstDigit);

    return checkDigits === `${firstDigit}${secondDigit}`;
  }
}
