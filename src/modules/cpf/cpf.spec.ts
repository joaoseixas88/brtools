import { Cpf } from ".";

const makeSut = () => new Cpf();

describe("Cpf Module", () => {
  describe("calculateWeightedSum", () => {
    it("should calculate correcty the sum of values", () => {
      const sut = makeSut()["calculateWeightedSum"];
      const baseNumbers = "321";
      expect(sut("321", 3)).toBe(14);
      expect(sut("54321", 10)).toBe(130);
    });
  });
});
