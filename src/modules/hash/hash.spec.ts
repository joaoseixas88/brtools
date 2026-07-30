import { compare } from 'bcryptjs';
import { HashModule } from '.';

const makeSut = () => new HashModule();

describe('Hash Module', () => {
  it('should generate a valid bcrypt hash', async () => {
    const sut = makeSut();

    const result = await sut.perform('bcrypt', { text: 'secret', salt: 4 });

    expect(await compare('secret', result)).toBe(true);
  });

  describe('password option', () => {
    const strongPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%&*?\-_]).{8,}$/;

    it('should generate and hash a strong password', async () => {
      const sut = makeSut();

      const result = await sut.perform('bcrypt', { password: true, salt: 4, json: true });
      const parsed = JSON.parse(result);

      expect(parsed.algorithm).toBe('bcrypt');
      expect(parsed.password).toMatch(strongPattern);
      expect(parsed.password).toHaveLength(12);
      expect(await compare(parsed.password, parsed.hash)).toBe(true);
    });

    it('should honour a custom password length', async () => {
      const sut = makeSut();

      const result = await sut.perform('sha256', { password: '20', json: true });

      expect(JSON.parse(result).password).toHaveLength(20);
    });

    it('should print the password alongside the hash in text mode', async () => {
      const sut = makeSut();

      const result = await sut.perform('sha256', { password: true });
      const [passwordLine, hashLine] = result.split('\n');

      expect(passwordLine).toMatch(/^Senha: \S{12}$/);
      expect(hashLine).toMatch(/^Hash: [a-f0-9]{64}$/);
    });

    it('should reject --password combined with --text or --file', async () => {
      const sut = makeSut();

      await expect(sut.perform('sha256', { password: true, text: 'secret' })).rejects.toThrow(
        /--password sozinho/,
      );
      await expect(sut.perform('sha256', { password: true, file: './a.txt' })).rejects.toThrow(
        /--password sozinho/,
      );
    });

    it('should reject a length outside the supported range', async () => {
      const sut = makeSut();

      await expect(sut.perform('sha256', { password: '7' })).rejects.toThrow(/--length/);
    });
  });
});
