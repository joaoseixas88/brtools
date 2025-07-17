import { CnpjModule } from './index';

const makeSut = () => new CnpjModule();

// validCnp = '71681624000160'
const base = '716816240001';
const firstDigit = '6';
const secondDigit = '0';

describe('CNPJ', () => {
  describe('Checksum', () => {
    it('should calculate correctly the base cnpj numbers', () => {
      const sut = makeSut();
      expect(sut['checkSum']('112223330001', 5)).toBe(102);
      expect(sut['checkSum']('1122233300018', 6)).toBe(120);
    });
  });

  describe('VerifyDigit', () => {
    it('should correctly verify cnpj digits', () => {
      const sut = makeSut();
      expect(sut['verifyDigit'](base)).toBe(parseInt(firstDigit));
      expect(sut['verifyDigit'](`${base}${firstDigit}`)).toBe(parseInt(secondDigit));
    });
  });
  describe('Validate', () => {
    it('should validate cnpj correctly', () => {
      const sut = makeSut();
      expect(sut.validate('71.681.624/0001-60')).toBe(true);
      expect(sut.validate('71681624000111')).toBe(false);
      expect(sut.validate('11111111111111')).toBe(false);
      expect(sut.validate('111')).toBe(false);
      expect(sut.validate('3.620.014/0001-04')).toBe(true);
    });
    it('should validate and complete a cpf thats starts with 0 and 0 is not present', () => {
      const sut = makeSut();
      expect(sut.validate('3.620.014/0001-04')).toBe(true);
    });
  });
  describe('Format', () => {
    it('should format cnpj correctly', () => {
      const sut = makeSut();
      expect(sut['format']('71681624000160')).toBe('71.681.624/0001-60');
    });
  });
});
