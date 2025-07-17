export class NumbersHelper {
  static genRandomNumber(lenght: number) {
    return Array(lenght)
      .fill(1)
      .reduce((acc) => `${acc}${Math.random().toString().slice(2, 3)}`, '');
  }

  static onlyNumbers(dirtyNumber: string) {
    return dirtyNumber.replace(/\D/g, '');
  }
}
