import { Cpf } from ".";
import { ValidationException } from "../../exceptions/Validation";

const makeSut = () => new Cpf();

describe("Cpf Module", () => {
  it("should calculate correcty the sum of values", () => {
    const sut = makeSut()["calculateWeightedSum"];
    expect(sut("321", 3)).toBe(14);
    expect(sut("54321", 10)).toBe(130);
    expect(sut("796803684", 10)).toBe(326);
  });

  it("should return correct first digit", () => {
    const sut = makeSut();
    expect(sut["verifyFirstDigit"]("859049585")).toBe(0);
    expect(sut["verifyFirstDigit"]("796803684")).toBe(4);
    expect(sut["verifyFirstDigit"]("037325280")).toBe(3);
  });
  it("should return correct first digit", () => {
    const sut = makeSut();
    expect(sut["verifySecondDigit"]("859049585", "0")).toBe(1);
    expect(sut["verifySecondDigit"]("796803684", "4")).toBe(0);
    expect(sut["verifySecondDigit"]("037325280", "3")).toBe(0);
  });

  it("should format cpf correctly", () => {
    const sut = makeSut();
    expect(sut["formatCpf"]("12345678900")).toBe("123.456.789-00");
    expect(sut["formatCpf"]("32323312300")).toBe("323.233.123-00");
  });

  it("should return false if invalid cpf is passed to validate method", () => {
    const sut = makeSut();
    expect(sut.validate("1234567890")).toBe(false);
  });
  it("should return true if valid cpf is passed to validate method", () => {
    const sut = makeSut();
    expect(sut.validate("01404875069")).toBe(true);
  });

  it("should validate event if value is formatted", () => {
    const sut = makeSut();
    expect(sut.validate("176.577.670-81")).toBe(true);
  });

  it("should be able to return verification digits if base number is passed", () => {
    const sut = makeSut();
    expect(sut.digits("176577670")).toBe("81");
  });

  it("should be able to generate a valid cpf if generate method is called", () => {
    const sut = makeSut();
    expect(sut.validate(sut.generate({}))).toBe(true);
  });

  describe("handler", () => {
    it("should throw validation error if more than one method is requested", () => {
      const sut = makeSut();
      expect(() => sut.handle({ generate: true, validate: "123" })).toThrow(
        ValidationException
      );
    });

    it("should validate correctly if validate value is passed", () => {
      const sut = makeSut();
      expect(sut.handle({ validate: "17657767081" }).output).toBe(
        "✅ CPF válido"
      );
    });

    it("should call correctly the digits method if digits value is passed", () => {
      const sut = makeSut();
      expect(sut.handle({ digits: "176577670" }).output).toBe(
        "Dígitos verificadores: 81"
      );
    });
    it("should call correctly the generate method generate method is requested", () => {
      const sut = makeSut();
      expect(sut.validate(sut.handle({ generate: true }).output)).toBe(true);
    });
    it("should call generate method if no method is requested", () => {
      const sut = makeSut();
      expect(sut.validate(sut.handle({}).output)).toBe(true);
    });
  });
});
