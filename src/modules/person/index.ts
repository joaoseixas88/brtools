import { ValidationException } from '../../exceptions/Validation';
import { generatePassword, hashPassword, resolvePasswordLength } from '../../helpers/password';
import { CliModule } from '../module';
import { Cpf } from '../cpf';
import {
  PersonAction,
  PersonAddress,
  PersonCommandOptions,
  PersonProfile,
  PersonSex,
} from './types';

const maleNames = ['João', 'Gabriel', 'Lucas', 'Pedro', 'Mateus', 'Rafael', 'Bruno', 'Felipe'];
const femaleNames = ['Maria', 'Ana', 'Julia', 'Larissa', 'Camila', 'Beatriz', 'Amanda', 'Mariana'];
const surnames = ['Silva', 'Souza', 'Oliveira', 'Santos', 'Pereira', 'Costa', 'Almeida', 'Lima'];
const streetNames = [
  'Rua das Flores',
  'Avenida Brasil',
  'Rua do Sol',
  'Rua das Palmeiras',
  'Travessa Central',
];
const neighborhoods = ['Centro', 'Jardim América', 'Vila Nova', 'Boa Vista', 'Santa Cecília'];
const cities = [
  { name: 'São Paulo', state: 'SP' },
  { name: 'Rio de Janeiro', state: 'RJ' },
  { name: 'Belo Horizonte', state: 'MG' },
  { name: 'Curitiba', state: 'PR' },
  { name: 'Salvador', state: 'BA' },
];
const emailProviders = ['gmail.com', 'hotmail.com', 'outlook.com', 'uol.com.br', 'empresa.com.br'];
const ligatures: Record<string, string> = { æ: 'ae', þ: 'th', ø: 'o', ß: 'ss', đ: 'd' };
const sexByGenderOption: Record<string, PersonSex> = {
  masculino: 'male',
  m: 'male',
  feminino: 'female',
  f: 'female',
};
const maxLocalPartLength = 64;
const suffixProbability = 30;

export class PersonModule extends CliModule {
  public cpfModule = new Cpf();

  override async perform(action: PersonAction, options: PersonCommandOptions): Promise<string> {
    const formatted = Boolean(options.formatted);
    const result = await this.execute(action, options, formatted);

    if (options.json) {
      return this.serializeJson(action, result);
    }

    return this.serializeText(action, result);
  }

  protected override async performValue(action: PersonAction, options: PersonCommandOptions) {
    return this.execute(action, options, Boolean(options.formatted));
  }

  private async execute(action: PersonAction, options: PersonCommandOptions, formatted: boolean) {
    switch (action) {
      case 'name':
        return this.generateName(this.resolveSex(options));
      case 'surname':
        return this.generateSurname();
      case 'full-name':
        return this.generateFullName(this.resolveSex(options));
      case 'email':
        return this.generateEmail(options);
      case 'cpf':
        return this.generateCpf(formatted);
      case 'phone':
        return this.generatePhone(formatted);
      case 'birthdate':
        return this.generateBirthdate(formatted);
      case 'gender':
        return this.generateGenderLabel(this.generateSex());
      case 'cep':
        return this.generateCep(formatted);
      case 'address':
        return this.generateAddress(formatted);
      case 'rg':
        return this.generateRg(formatted);
      case 'password':
        return this.generatePassword(options);
      case 'profile':
        return this.generateProfile(options, formatted);
      default:
        return '';
    }
  }

  private generateSex(): PersonSex {
    return this.randomItem<PersonSex>(['male', 'female']);
  }

  private resolveSex(options: PersonCommandOptions): PersonSex {
    if (!options.gender) {
      return this.generateSex();
    }

    const sex = sexByGenderOption[options.gender.trim().toLowerCase()];

    if (!sex) {
      throw new ValidationException(
        `Gênero inválido: ${options.gender}. Use: ${Object.keys(sexByGenderOption).join(' | ')}`,
      );
    }

    return sex;
  }

  private resolveSuppliedName(options: PersonCommandOptions) {
    if (!options.name) {
      return null;
    }

    const parts = options.name.trim().split(/\s+/).filter(Boolean);

    if (!parts.length) {
      return null;
    }

    const [firstName, ...rest] = parts;

    return {
      fullName: parts.join(' '),
      firstName,
      surname: rest[rest.length - 1] || '',
    };
  }

  private generateGenderLabel(sex: PersonSex) {
    return sex === 'male' ? 'masculino' : 'feminino';
  }

  private generateName(sex?: PersonSex) {
    const names = (sex || this.generateSex()) === 'male' ? maleNames : femaleNames;
    return this.randomItem(names);
  }

  private generateSurname() {
    return this.randomItem(surnames);
  }

  private generateFullName(sex?: PersonSex) {
    const resolvedSex = sex || this.generateSex();
    const firstName = this.generateName(resolvedSex);
    const surname = this.generateSurname();
    return `${firstName} ${surname}`;
  }

  private generateEmail(options: PersonCommandOptions) {
    const nameParts = this.resolveEmailNameParts(options);
    const provider = options.domain || this.randomItem(emailProviders);
    const localPart = nameParts ? this.buildLocalPart(nameParts) : '';

    if (!localPart) {
      return `${this.randomAlphaNumeric(10)}@${provider}`.toLowerCase();
    }

    return `${localPart}@${provider}`.toLowerCase();
  }

  private localPartPatterns(firstName: string, surname: string) {
    return [
      `${firstName}.${surname}`,
      `${firstName}_${surname}`,
      `${firstName}${surname}`,
      `${firstName.slice(0, 1)}.${surname}`,
      `${firstName}.${surname.slice(0, 1)}`,
      `${surname}.${firstName}`,
    ];
  }

  private buildLocalPart(nameParts: { firstName: string; surname: string }) {
    const firstName = this.normalizeText(nameParts.firstName);
    const surname = this.normalizeText(nameParts.surname);

    if (!firstName && !surname) {
      return '';
    }

    const base =
      firstName && surname
        ? this.randomItem(this.localPartPatterns(firstName, surname))
        : firstName || surname;
    const suffix =
      this.randomNumber(1, 100) <= suffixProbability ? this.randomDigits(2, false) : '';

    return this.capLocalPart(`${this.collapseSeparators(base)}${suffix}`);
  }

  private resolveEmailNameParts(options: PersonCommandOptions) {
    if (options.name) {
      const [firstName, ...surnameParts] = options.name.trim().split(/\s+/);

      return {
        firstName,
        surname: surnameParts[surnameParts.length - 1] || '',
      };
    }

    if (options.firstName || options.surname) {
      return {
        firstName: options.firstName || '',
        surname: options.surname || '',
      };
    }

    return null;
  }

  private generateCpf(formatted: boolean) {
    return this.cpfModule.generate({ formatted });
  }

  private generatePhone(formatted: boolean) {
    const ddd = `${this.randomNumber(11, 99)}`;
    const phone = `9${this.randomDigits(8, false)}`;

    if (!formatted) {
      return `${ddd}${phone}`;
    }

    return `(${ddd}) ${phone.slice(0, 5)}-${phone.slice(5)}`;
  }

  private generateBirthdate(formatted: boolean) {
    const birthdate = this.randomBirthdate();
    const year = birthdate.getFullYear();
    const month = `${birthdate.getMonth() + 1}`.padStart(2, '0');
    const day = `${birthdate.getDate()}`.padStart(2, '0');

    if (!formatted) {
      return `${year}-${month}-${day}`;
    }

    return `${day}/${month}/${year}`;
  }

  private generateCep(formatted: boolean) {
    const cep = this.randomDigits(8, false);

    if (!formatted) {
      return cep;
    }

    return `${cep.slice(0, 5)}-${cep.slice(5)}`;
  }

  private generateAddress(formatted: boolean): PersonAddress {
    const city = this.randomItem(cities);

    return {
      street: this.randomItem(streetNames),
      number: `${this.randomNumber(1, 9999)}`,
      neighborhood: this.randomItem(neighborhoods),
      city: city.name,
      state: city.state,
      cep: this.generateCep(formatted),
    };
  }

  private generateRg(formatted: boolean) {
    const rg = this.randomDigits(9, false);

    if (!formatted) {
      return rg;
    }

    return `${rg.slice(0, 2)}.${rg.slice(2, 5)}.${rg.slice(5, 8)}-${rg.slice(8)}`;
  }

  private generatePassword(options: PersonCommandOptions) {
    return generatePassword(resolvePasswordLength(options.length));
  }

  private async generateProfile(
    options: PersonCommandOptions,
    formatted: boolean,
  ): Promise<PersonProfile> {
    const sex = this.resolveSex(options);
    const suppliedName = this.resolveSuppliedName(options);
    const firstName = suppliedName ? suppliedName.firstName : this.generateName(sex);
    const surname = suppliedName ? suppliedName.surname : this.generateSurname();
    const fullName = suppliedName
      ? suppliedName.fullName
      : `${firstName}${surname ? ` ${surname}` : ''}`;
    const address = this.generateAddress(formatted);
    const password = this.generatePassword(options);

    return {
      fullName,
      cpf: this.generateCpf(formatted),
      email: this.generateEmail({ firstName, surname }),
      phone: this.generatePhone(formatted),
      birthdate: this.generateBirthdate(formatted),
      gender: this.generateGenderLabel(sex),
      cep: this.generateCep(formatted),
      address,
      rg: this.generateRg(formatted),
      password,
      passwordHash: await hashPassword(password, options.salt),
    };
  }

  private serializeJson(action: PersonAction, result: string | PersonAddress | PersonProfile) {
    if (action === 'profile') {
      return JSON.stringify(result, null, 2);
    }

    return JSON.stringify({ [this.toJsonKey(action)]: result }, null, 2);
  }

  private serializeText(action: PersonAction, result: string | PersonAddress | PersonProfile) {
    if (action === 'profile') {
      return this.formatProfile(result as PersonProfile);
    }

    if (action === 'address') {
      return this.formatAddress(result as PersonAddress);
    }

    return result as string;
  }

  private formatAddress(address: PersonAddress) {
    return `${address.street}, ${address.number}, ${address.neighborhood}, ${address.city} - ${address.state}, ${address.cep}`;
  }

  private formatProfile(profile: PersonProfile) {
    return [
      `Nome completo: ${profile.fullName}`,
      `CPF: ${profile.cpf}`,
      `E-mail: ${profile.email}`,
      `Telefone: ${profile.phone}`,
      `Data de nascimento: ${profile.birthdate}`,
      `Gênero: ${profile.gender}`,
      `CEP: ${profile.cep}`,
      `Endereço: ${this.formatAddress(profile.address)}`,
      `RG: ${profile.rg}`,
      `Senha: ${profile.password}`,
      `Hash da senha: ${profile.passwordHash}`,
    ].join('\n');
  }

  private toJsonKey(action: PersonAction) {
    const keys: Record<PersonAction, string> = {
      name: 'name',
      surname: 'surname',
      'full-name': 'fullName',
      email: 'email',
      cpf: 'cpf',
      phone: 'phone',
      birthdate: 'birthdate',
      gender: 'gender',
      cep: 'cep',
      address: 'address',
      rg: 'rg',
      password: 'password',
      profile: 'profile',
    };

    return keys[action];
  }

  private randomItem<T>(items: T[]) {
    return items[Math.floor(Math.random() * items.length)];
  }

  private randomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private randomDigits(length: number, allowLeadingZero = true) {
    let value = '';

    for (let index = 0; index < length; index++) {
      const min = index === 0 && !allowLeadingZero ? 1 : 0;
      value += this.randomNumber(min, 9).toString();
    }

    return value;
  }

  private randomAlphaNumeric(length: number) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let value = '';

    for (let index = 0; index < length; index++) {
      value += chars[Math.floor(Math.random() * chars.length)];
    }

    return value;
  }

  private transliterate(value: string) {
    return value.replace(/[\u00e6\u00fe\u00f8\u00df\u0111]/g, (char) => ligatures[char]);
  }

  private normalizeText(value: string) {
    return this.transliterate(value.toLowerCase())
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/['\u2019-]/g, '')
      .replace(/[^a-z0-9]+/g, '.')
      .replace(/\.+/g, '.')
      .replace(/^\.|\.$/g, '');
  }

  private collapseSeparators(value: string) {
    return value.replace(/[._]{2,}/g, '.').replace(/^[._]+|[._]+$/g, '');
  }

  private capLocalPart(value: string) {
    if (value.length <= maxLocalPartLength) {
      return value;
    }

    return value.slice(0, maxLocalPartLength).replace(/[._]+$/g, '');
  }

  private randomBirthdate() {
    const currentYear = new Date().getFullYear();
    const year = this.randomNumber(currentYear - 90, currentYear - 18);
    const month = this.randomNumber(1, 12);
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    const day = this.randomNumber(1, lastDayOfMonth);

    return new Date(year, month - 1, day);
  }
}
