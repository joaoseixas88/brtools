export type PersonSex = 'male' | 'female';

export type PersonAddress = {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
};

export type PersonProfile = {
  fullName: string;
  cpf: string;
  email: string;
  phone: string;
  birthdate: string;
  gender: string;
  cep: string;
  address: PersonAddress;
  rg: string;
  password: string;
  passwordHash: string;
};

export type PersonAction =
  | 'name'
  | 'surname'
  | 'full-name'
  | 'email'
  | 'cpf'
  | 'phone'
  | 'birthdate'
  | 'gender'
  | 'cep'
  | 'address'
  | 'rg'
  | 'password'
  | 'profile';

export type PersonCommandOptions = {
  copy?: boolean;
  json?: boolean;
  formatted?: boolean;
  name?: string;
  firstName?: string;
  surname?: string;
  domain?: string;
  gender?: string;
  length?: string | number;
  salt?: string | number;
};
