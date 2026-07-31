import { Readable } from 'stream';
import { Cpf } from './cpf';
import { CnpjModule } from './cnpj';
import { HashModule } from './hash';
import { EXIT_INVALID, EXIT_OK } from './module';

const withStdin = async <T>(content: string, run: () => Promise<T>) => {
  const original = Object.getOwnPropertyDescriptor(process, 'stdin');

  Object.defineProperty(process, 'stdin', {
    value: Readable.from([content]),
    configurable: true,
  });

  try {
    return await run();
  } finally {
    if (original) {
      Object.defineProperty(process, 'stdin', original);
    }
  }
};

describe('shared cli behaviour', () => {
  describe('--count', () => {
    it('should reject a non positive count', () => {
      const sut = new Cpf();

      expect(() => sut['resolveCount']({ count: '0' })).toThrow(/inteiro maior que zero/);
      expect(() => sut['resolveCount']({ count: 'abc' })).toThrow(/inteiro maior que zero/);
    });

    it('should reject a count above the cap', () => {
      const sut = new Cpf();

      expect(() => sut['resolveCount']({ count: '10001' })).toThrow(/no máximo 10000/);
    });

    it('should default to one when count is absent', () => {
      const sut = new Cpf();

      expect(sut['resolveCount']({})).toBe(1);
    });

    it('should generate the requested amount of unique values', async () => {
      const sut = new Cpf();

      const output = await sut['performMany'](50, [{ generate: true }], false);
      const values = output.split('\n');

      expect(values).toHaveLength(50);
      expect(new Set(values).size).toBe(50);
      values.forEach((value) => expect(sut.validate(value)).toBe(true));
    });

    it('should emit a flat json array when json is requested', async () => {
      const sut = new CnpjModule();

      const output = await sut['performMany'](5, [{ generate: true }], true);
      const parsed = JSON.parse(output);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(5);
      parsed.forEach((value: string) => expect(typeof value).toBe('string'));
    });

    it('should keep one value per line so the output stays pipe safe', async () => {
      const sut = new Cpf();

      const output = await sut['performMany'](20, [{ generate: true }], false);

      expect(output.split('\n')).toHaveLength(20);
      expect(output).not.toMatch(/\n\s*\n/);
      expect(output).not.toMatch(/\n$/);
    });

    it('should still emit an array when a single item is requested', async () => {
      const sut = new Cpf();

      const output = await sut['performMany'](1, [{ generate: true }], true);
      const parsed = JSON.parse(output);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(1);
      expect(sut.validate(parsed[0])).toBe(true);
    });

    it('should fail when the pool cannot satisfy the count', async () => {
      const sut = new Cpf();
      jest.spyOn(sut, 'generate').mockReturnValue('11111111111');

      await expect(sut['performMany'](5, [{ generate: true }], false)).rejects.toThrow(
        /Máximo alcançado: 1/,
      );
    });

    it('should reject count together with validate', async () => {
      const sut = new Cpf();

      await expect(sut.perform({ validate: '17657767081', count: '3' })).rejects.toThrow(
        /--count só se aplica/,
      );
    });
  });

  describe('--json', () => {
    it('should wrap a generated cpf', async () => {
      const sut = new Cpf();

      const parsed = JSON.parse(await sut.perform({ generate: true, json: true }));

      expect(sut.validate(parsed.cpf)).toBe(true);
    });

    it('should wrap a generated cnpj', async () => {
      const sut = new CnpjModule();

      const parsed = JSON.parse(await sut.perform({ generate: true, json: true }));

      expect(sut.validate(parsed.cnpj)).toBe(true);
    });

    it('should report validation as a structured result', async () => {
      const sut = new Cpf();

      const parsed = JSON.parse(await sut.perform({ validate: '11144477735', json: true }));

      expect(parsed).toEqual({ document: '11144477735', valid: true });
    });

    it('should wrap a hash with its algorithm', async () => {
      const sut = new HashModule();

      const parsed = JSON.parse(await sut.perform('md5', { text: 'abc', json: true }));

      expect(parsed).toEqual({
        algorithm: 'md5',
        hash: '900150983cd24fb0d6963f7d28e17f72',
      });
    });
  });

  describe('exit code', () => {
    it('should stay zero for a valid document', async () => {
      const sut = new Cpf();

      await sut.perform({ validate: '11144477735' });

      expect(sut['exitCode']).toBe(EXIT_OK);
    });

    it('should flag an invalid document', async () => {
      const sut = new Cpf();

      await sut.perform({ validate: '12345678901' });

      expect(sut['exitCode']).toBe(EXIT_INVALID);
    });
  });

  describe('stdin', () => {
    it('should validate every line received', async () => {
      const sut = new Cpf();

      const output = await withStdin('11144477735\n12345678901\n', () =>
        sut.perform({ validate: '-' }),
      );

      expect(output.split('\n')).toHaveLength(2);
      expect(output).toContain('11144477735');
      expect(sut['exitCode']).toBe(EXIT_INVALID);
    });

    it('should ignore blank lines', async () => {
      const sut = new Cpf();

      const output = await withStdin('\n11144477735\n\n  \n', () => sut.perform({ validate: '-' }));

      expect(output).toBe('✅ CPF válido');
      expect(sut['exitCode']).toBe(EXIT_OK);
    });

    it('should fail when stdin is empty', async () => {
      const sut = new CnpjModule();

      await expect(withStdin('', () => sut.perform({ validate: '-' }))).rejects.toThrow(
        /Nenhum CNPJ recebido/,
      );
    });

    it('should hash content read from stdin', async () => {
      const sut = new HashModule();

      const output = await withStdin('abc', () => sut.perform('md5', { text: '-' }));

      expect(output).toBe('900150983cd24fb0d6963f7d28e17f72');
    });
  });
});
