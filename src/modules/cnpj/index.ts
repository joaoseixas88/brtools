import { NumbersHelper } from "../../helpers/numbers";
import { CliModule } from "../module";

export class CnpjModule extends CliModule {
  handle(options: any): CliModule.Result {
    throw new Error("Method not implemented.");
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

  generate() {
    const baseNumber = NumbersHelper.genRandomNumber(8);
    const base = `${baseNumber}0001`;
    const firstDigit = this.verifyDigit(base);
    const secondDigit = this.verifyDigit(`${base}${firstDigit}`);
    return `${base}${firstDigit}${secondDigit}`;
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

  private format(cnpj: string) {
    return cnpj
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
}
