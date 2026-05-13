import { compare } from 'bcryptjs';
import { HashModule } from '.';

const makeSut = () => new HashModule();

describe('Hash Module', () => {
  it('should generate a valid bcrypt hash', async () => {
    const sut = makeSut();

    const result = await sut.perform('bcrypt', { text: 'secret', salt: 4 });

    expect(await compare('secret', result)).toBe(true);
  });
});
