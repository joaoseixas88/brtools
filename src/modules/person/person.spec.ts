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
    });
    expect(sut['cpfModule'].validate(parsed.cpf)).toBe(true);
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
