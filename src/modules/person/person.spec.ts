import { compare } from 'bcryptjs';
import { PersonModule } from '.';

const makeSut = () => new PersonModule();

describe('Person Module', () => {
  it('should generate a valid cpf', async () => {
    const sut = makeSut();

    expect(sut['cpfModule'].validate(await sut.perform('cpf', {}))).toBe(true);
  });

  it('should format cpf when requested', async () => {
    const sut = makeSut();

    expect(await sut.perform('cpf', { formatted: true })).toMatch(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
  });

  it('should derive email from full name in any of the supported patterns', async () => {
    const sut = makeSut();

    const result = await sut.perform('email', { name: 'João da Silva' });
    const localPart = result.split('@')[0].replace(/\d+$/, '');

    expect(['joao.silva', 'joao_silva', 'joaosilva', 'j.silva', 'joao.s', 'silva.joao']).toContain(
      localPart,
    );
  });

  it('should eventually use every email pattern', async () => {
    const sut = makeSut();
    const seen = new Set<string>();

    for (let index = 0; index < 500; index++) {
      const email = sut['generateEmail']({ firstName: 'Joao', surname: 'Silva' });
      seen.add(email.split('@')[0].replace(/\d+$/, ''));
    }

    expect(seen.size).toBe(6);
  });

  it('should not append a numeric suffix to every email', async () => {
    const sut = makeSut();
    let withSuffix = 0;

    for (let index = 0; index < 500; index++) {
      const email = sut['generateEmail']({ firstName: 'Joao', surname: 'Silva' });
      if (/\d+@/.test(email)) {
        withSuffix++;
      }
    }

    expect(withSuffix).toBeGreaterThan(0);
    expect(withSuffix).toBeLessThan(500);
  });

  it('should always produce a valid local part', async () => {
    const sut = makeSut();
    const names = [
      'João da Silva',
      "Thaís D'Ávila",
      'Ana Paula Silva-Costa',
      'Æon Þorvald',
      '!!! @@@',
      '   ',
      'a@b.com c@d.com',
      'João',
      'Wolfeschlegelsteinhausenbergerdorff Bagginsmcgillicuttyfitzgerald',
    ];

    for (const name of names) {
      for (let index = 0; index < 30; index++) {
        const localPart = (await sut.perform('email', { name })).split('@')[0];

        expect(localPart.length).toBeGreaterThan(0);
        expect(localPart.length).toBeLessThanOrEqual(64);
        expect(localPart).toMatch(/^[a-z0-9]/);
        expect(localPart).toMatch(/[a-z0-9]$/);
        expect(localPart).not.toMatch(/[._]{2}/);
      }
    }
  });

  it('should sanitize names into email safe text', () => {
    const sut = makeSut();
    const normalize = (value: string) => sut['normalizeText'](value);

    expect(normalize('João Gonçalves')).toBe('joao.goncalves');
    expect(normalize("D'Ávila")).toBe('davila');
    expect(normalize('Silva-Costa')).toBe('silvacosta');
    expect(normalize('Æon')).toBe('aeon');
    expect(normalize('Þorvald')).toBe('thorvald');
    expect(normalize('!!! @@@')).toBe('');
    expect(normalize('   ')).toBe('');
  });

  it('should cap the local part at the rfc limit', () => {
    const sut = makeSut();
    const long = 'a'.repeat(70);

    expect(sut['capLocalPart'](long)).toHaveLength(64);
    expect(sut['capLocalPart']('joao.silva')).toBe('joao.silva');
    expect(sut['capLocalPart'](`${'a'.repeat(63)}.b`)).not.toMatch(/\.$/);
  });

  it('should omit the surname when only one name is supplied', async () => {
    const sut = makeSut();

    const result = await sut.perform('email', { name: 'João' });

    expect(result.split('@')[0]).toMatch(/^joao\d*$/);
  });

  it('should use custom domain for email', async () => {
    const sut = makeSut();

    const result = await sut.perform('email', {
      firstName: 'Maria',
      surname: 'Souza',
      domain: 'empresa.com.br',
    });

    expect(result).toMatch(/@empresa\.com\.br$/);
  });

  it('should generate formatted phone when requested', async () => {
    const sut = makeSut();

    expect(await sut.perform('phone', { formatted: true })).toMatch(/^\(\d{2}\) 9\d{4}-\d{4}$/);
  });

  it('should generate raw cep by default', async () => {
    const sut = makeSut();

    expect(await sut.perform('cep', {})).toMatch(/^\d{8}$/);
  });

  it('should generate formatted rg when requested', async () => {
    const sut = makeSut();

    expect(await sut.perform('rg', { formatted: true })).toMatch(/^\d{2}\.\d{3}\.\d{3}-\d$/);
  });

  it('should generate json for unitary commands', async () => {
    const sut = makeSut();

    const result = await sut.perform('name', { json: true });

    expect(JSON.parse(result)).toEqual({ name: expect.any(String) });
  });

  it('should generate an address object in json mode', async () => {
    const sut = makeSut();

    const result = await sut.perform('address', { json: true, formatted: true });

    expect(JSON.parse(result)).toEqual({
      address: {
        street: expect.any(String),
        number: expect.any(String),
        neighborhood: expect.any(String),
        city: expect.any(String),
        state: expect.any(String),
        cep: expect.stringMatching(/^\d{5}-\d{3}$/),
      },
    });
  });

  it('should generate a profile with all expected fields in json mode', async () => {
    const sut = makeSut();

    const result = await sut.perform('profile', { json: true, formatted: true });
    const parsed = JSON.parse(result);

    expect(parsed).toEqual({
      fullName: expect.any(String),
      cpf: expect.stringMatching(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/),
      email: expect.any(String),
      phone: expect.stringMatching(/^\(\d{2}\) 9\d{4}-\d{4}$/),
      birthdate: expect.stringMatching(/^\d{2}\/\d{2}\/\d{4}$/),
      gender: expect.stringMatching(/^(masculino|feminino)$/),
      cep: expect.stringMatching(/^\d{5}-\d{3}$/),
      address: {
        street: expect.any(String),
        number: expect.any(String),
        neighborhood: expect.any(String),
        city: expect.any(String),
        state: expect.any(String),
        cep: expect.stringMatching(/^\d{5}-\d{3}$/),
      },
      rg: expect.stringMatching(/^\d{2}\.\d{3}\.\d{3}-\d$/),
      password: expect.any(String),
      passwordHash: expect.stringMatching(/^\$2[aby]\$\d{2}\$/),
    });
    expect(sut['cpfModule'].validate(parsed.cpf)).toBe(true);
  });

  describe('password', () => {
    const strongPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%&*?\-_]).{8,}$/;

    it('should generate a strong password with the default length', async () => {
      const sut = makeSut();

      for (let index = 0; index < 200; index++) {
        const password = await sut.perform('password', {});

        expect(password).toHaveLength(12);
        expect(password).toMatch(strongPattern);
      }
    });

    it('should honour a custom length', async () => {
      const sut = makeSut();

      const password = await sut.perform('password', { length: 32 });

      expect(password).toHaveLength(32);
      expect(password).toMatch(strongPattern);
    });

    it('should reject a length outside the supported range', async () => {
      const sut = makeSut();

      await expect(sut.perform('password', { length: 7 })).rejects.toThrow(/--length/);
      await expect(sut.perform('password', { length: 65 })).rejects.toThrow(/--length/);
      await expect(sut.perform('password', { length: 'abc' })).rejects.toThrow(/--length/);
    });

    it('should return the password in json mode', async () => {
      const sut = makeSut();

      const result = await sut.perform('password', { json: true });

      expect(JSON.parse(result)).toEqual({ password: expect.stringMatching(strongPattern) });
    });

    it('should hash the profile password with bcrypt', async () => {
      const sut = makeSut();

      const parsed = JSON.parse(await sut.perform('profile', { json: true, salt: 4 }));

      expect(parsed.password).toMatch(strongPattern);
      expect(await compare(parsed.password, parsed.passwordHash)).toBe(true);
    });

    it('should reject a salt outside the supported range', async () => {
      const sut = makeSut();

      await expect(sut.perform('profile', { salt: 3 })).rejects.toThrow(/--salt/);
      await expect(sut.perform('profile', { salt: 16 })).rejects.toThrow(/--salt/);
    });

    it('should print the password and its hash in text mode', async () => {
      const sut = makeSut();

      const result = await sut.perform('profile', { salt: 4 });

      expect(result).toMatch(/\nSenha: \S{12}\n/);
      expect(result).toMatch(/\nHash da senha: \$2[aby]\$\d{2}\$\S+$/);
    });
  });

  describe('batch output', () => {
    it('should emit profiles as json objects instead of formatted text', async () => {
      const sut = makeSut();

      const output = await sut['performMany'](3, ['profile', { formatted: true, salt: 4 }], true);
      const parsed = JSON.parse(output);

      expect(parsed).toHaveLength(3);
      parsed.forEach((profile) => {
        expect(profile.fullName).toEqual(expect.any(String));
        expect(sut['cpfModule'].validate(profile.cpf)).toBe(true);
        expect(profile.address.city).toEqual(expect.any(String));
        expect(profile.passwordHash).toMatch(/^\$2[aby]\$\d{2}\$/);
      });
    });

    it('should emit addresses as json objects', async () => {
      const sut = makeSut();

      const output = await sut['performMany'](3, ['address', {}], true);
      const parsed = JSON.parse(output);

      expect(parsed).toHaveLength(3);
      parsed.forEach((address) => {
        expect(address.street).toEqual(expect.any(String));
        expect(address.cep).toMatch(/^\d{8}$/);
      });
    });

    it('should keep scalar generators as json strings', async () => {
      const sut = makeSut();

      const output = await sut['performMany'](3, ['password', {}], true);
      const parsed = JSON.parse(output);

      expect(parsed).toHaveLength(3);
      parsed.forEach((password) => expect(typeof password).toBe('string'));
    });

    it('should separate multi line records with a blank line', async () => {
      const sut = makeSut();

      const output = await sut['performMany'](3, ['profile', { salt: 4 }], false);
      const records = output.split('\n\n');

      expect(records).toHaveLength(3);
      records.forEach((record) => expect(record).toMatch(/^Nome completo: /));
    });

    it('should keep single line records one per line', async () => {
      const sut = makeSut();

      const output = await sut['performMany'](3, ['address', {}], false);

      expect(output.split('\n')).toHaveLength(3);
      expect(output).not.toMatch(/\n\s*\n/);
    });
  });

  describe('gender option', () => {
    it('should pick the name from the pool matching the requested gender', async () => {
      const sut = makeSut();
      const female = ['Maria', 'Ana', 'Julia', 'Larissa', 'Camila', 'Beatriz', 'Amanda', 'Mariana'];

      for (let index = 0; index < 30; index++) {
        expect(female).toContain(await sut.perform('name', { gender: 'feminino' }));
      }
    });

    it('should accept the short gender form', async () => {
      const sut = makeSut();
      const male = ['João', 'Gabriel', 'Lucas', 'Pedro', 'Mateus', 'Rafael', 'Bruno', 'Felipe'];

      for (let index = 0; index < 30; index++) {
        expect(male).toContain(await sut.perform('name', { gender: 'm' }));
      }
    });

    it('should keep the profile gender coherent with the requested one', async () => {
      const sut = makeSut();

      const result = await sut.perform('profile', { json: true, gender: 'feminino' });

      expect(JSON.parse(result).gender).toBe('feminino');
    });

    it('should reject an unknown gender', async () => {
      const sut = makeSut();

      await expect(sut.perform('profile', { gender: 'xyz' })).rejects.toThrow(/Gênero inválido/);
    });
  });

  describe('name option on profile', () => {
    it('should keep the supplied name untouched and sanitize only the email', async () => {
      const sut = makeSut();

      const result = await sut.perform('profile', { json: true, name: "Thaís D'Ávila" });
      const parsed = JSON.parse(result);

      expect(parsed.fullName).toBe("Thaís D'Ávila");
      expect(parsed.email.split('@')[0].replace(/\d+$/, '')).toMatch(/^(thais|t|davila)[._]?/);
    });

    it('should keep middle names in the full name', async () => {
      const sut = makeSut();

      const result = await sut.perform('profile', { json: true, name: 'Ana Paula Silva-Costa' });

      expect(JSON.parse(result).fullName).toBe('Ana Paula Silva-Costa');
    });

    it('should not invent a surname when only one name is supplied', async () => {
      const sut = makeSut();

      const result = await sut.perform('profile', { json: true, name: 'João' });
      const parsed = JSON.parse(result);

      expect(parsed.fullName).toBe('João');
      expect(parsed.email.split('@')[0]).toMatch(/^joao\d*$/);
    });
  });
});
