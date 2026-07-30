import { randomInt } from 'crypto';
import { hash } from 'bcryptjs';
import { ValidationException } from '../exceptions/Validation';

const lowercase = 'abcdefghijklmnopqrstuvwxyz';
const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const digits = '0123456789';
const symbols = '!@#$%&*?-_';
const requiredSets = [lowercase, uppercase, digits, symbols];
const alphabet = requiredSets.join('');

export const minPasswordLength = 8;
export const defaultPasswordLength = 12;
export const maxPasswordLength = 64;
export const defaultSaltRounds = 10;
const minSaltRounds = 4;
const maxSaltRounds = 15;

export function resolvePasswordLength(value?: string | number | boolean) {
  if (value === undefined || value === true || value === '') {
    return defaultPasswordLength;
  }

  const length = Number(value);

  if (!Number.isInteger(length) || length < minPasswordLength || length > maxPasswordLength) {
    throw new ValidationException(
      `--length deve ser um número inteiro entre ${minPasswordLength} e ${maxPasswordLength}`,
    );
  }

  return length;
}

export function resolveSaltRounds(value?: string | number) {
  if (value === undefined) {
    return defaultSaltRounds;
  }

  const salt = Number(value);

  if (!Number.isInteger(salt) || salt < minSaltRounds || salt > maxSaltRounds) {
    throw new ValidationException(
      `--salt deve ser um número inteiro entre ${minSaltRounds} e ${maxSaltRounds}`,
    );
  }

  return salt;
}

export function generatePassword(length = defaultPasswordLength) {
  const chars = requiredSets.map((set) => set[randomInt(set.length)]);

  while (chars.length < length) {
    chars.push(alphabet[randomInt(alphabet.length)]);
  }

  return shuffle(chars).join('');
}

export function hashPassword(password: string, salt?: string | number) {
  return hash(password, resolveSaltRounds(salt));
}

function shuffle(chars: string[]) {
  for (let index = chars.length - 1; index > 0; index--) {
    const target = randomInt(index + 1);
    [chars[index], chars[target]] = [chars[target], chars[index]];
  }

  return chars;
}
