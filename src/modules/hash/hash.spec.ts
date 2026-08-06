import { compare } from 'bcryptjs';
import { scryptSync } from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { HashModule } from '.';

const makeSut = () => new HashModule();

const verifyScrypt = (value: string, phcString: string) => {
  const [, id, params, salt, hash] = phcString.split('$');
  const [n, r, p] = params.split(',').map((param) => Number(param.split('=')[1]));
  const saltBuffer = Buffer.from(salt, 'base64');
  const hashBuffer = Buffer.from(hash, 'base64');

  if (id !== 'scrypt') {
    return false;
  }

  const computed = scryptSync(value, saltBuffer, hashBuffer.length, {
    cost: n,
    blockSize: r,
    parallelization: p,
    maxmem: 32 * 1024 * 1024,
  });

  return computed.equals(hashBuffer);
};

describe('Hash Module', () => {
  it('should generate a valid bcrypt hash', async () => {
    const sut = makeSut();

    const result = await sut.perform('bcrypt', { text: 'secret', salt: 4 });

    expect(await compare('secret', result)).toBe(true);
  });

  describe('scrypt algorithm', () => {
    it('should generate a phc string using the adonis defaults', async () => {
      const sut = makeSut();

      const result = await sut.perform('scrypt', { text: 'secret' });

      expect(result.startsWith('$scrypt$n=16384,r=8,p=1$')).toBe(true);
      expect(verifyScrypt('secret', result)).toBe(true);
    });

    it('should honour custom scrypt parameters', async () => {
      const sut = makeSut();

      const result = await sut.perform('scrypt', { text: 'secret', cost: '1024', blockSize: '4' });

      expect(result.startsWith('$scrypt$n=1024,r=4,p=1$')).toBe(true);
      expect(verifyScrypt('secret', result)).toBe(true);
    });

    it('should hash the content of a file', async () => {
      const sut = makeSut();
      const file = path.join(os.tmpdir(), `brtools-scrypt-${process.pid}.txt`);
      fs.writeFileSync(file, 'conteúdo do arquivo', 'utf8');

      try {
        const result = await sut.perform('scrypt', { file, cost: '1024' });

        expect(verifyScrypt('conteúdo do arquivo', result)).toBe(true);
      } finally {
        fs.unlinkSync(file);
      }
    });

    it('should generate and hash a strong password', async () => {
      const sut = makeSut();

      const result = await sut.perform('scrypt', { password: true, cost: '1024', json: true });
      const parsed = JSON.parse(result);

      expect(parsed.algorithm).toBe('scrypt');
      expect(parsed.password).toHaveLength(12);
      expect(verifyScrypt(parsed.password, parsed.hash)).toBe(true);
    });

    it('should reject invalid scrypt parameters', async () => {
      const sut = makeSut();

      await expect(sut.perform('scrypt', { text: 'secret', cost: '3000' })).rejects.toThrow(
        /potência de 2/,
      );
    });
  });

  it('should list scrypt among the available algorithms', async () => {
    const sut = makeSut();

    await expect(sut.perform('sciprt' as never, { text: 'secret' })).rejects.toThrow(
      /Disponíveis: < bcrypt \| scrypt \| md5 \| sha256 \| sha512 \| base64 >/,
    );
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
