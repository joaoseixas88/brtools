import { BinaryLike, randomBytes, scrypt, ScryptOptions } from 'crypto';
import { promisify } from 'util';
import { ValidationException } from '../exceptions/Validation';

const randomBytesAsync = promisify(randomBytes);
const scryptAsync = promisify<BinaryLike, BinaryLike, number, ScryptOptions, Buffer>(scrypt);

const maxUint32 = 2 ** 32 - 1;

export type ScryptConfig = {
  cost: number;
  blockSize: number;
  parallelization: number;
  saltSize: number;
  keyLength: number;
  maxMemory: number;
};

export type ScryptConfigOptions = {
  [key in keyof ScryptConfig]?: string | number;
};

export const defaultScryptConfig: ScryptConfig = {
  cost: 16384,
  blockSize: 8,
  parallelization: 1,
  saltSize: 16,
  keyLength: 64,
  maxMemory: 32 * 1024 * 1024,
};

const flagNames: Record<keyof ScryptConfig, string> = {
  cost: 'cost',
  blockSize: 'block-size',
  parallelization: 'parallelization',
  saltSize: 'salt-size',
  keyLength: 'key-length',
  maxMemory: 'max-memory',
};

export function resolveScryptConfig(options: ScryptConfigOptions = {}): ScryptConfig {
  const config: ScryptConfig = {
    cost: toInteger('cost', options.cost),
    blockSize: toInteger('blockSize', options.blockSize),
    parallelization: toInteger('parallelization', options.parallelization),
    saltSize: toInteger('saltSize', options.saltSize),
    keyLength: toInteger('keyLength', options.keyLength),
    maxMemory: toInteger('maxMemory', options.maxMemory),
  };

  validateRange('blockSize', config.blockSize, 1, maxUint32);
  validateRange('cost', config.cost, 2, maxUint32);
  validatePowerOfTwo(config.cost);
  validateRange(
    'parallelization',
    config.parallelization,
    1,
    Math.floor((maxUint32 * 32) / (128 * config.blockSize)),
  );
  validateRange('saltSize', config.saltSize, 8, 1024);
  validateRange('keyLength', config.keyLength, 64, 128);
  validateMaxMemory(config);

  return config;
}

export async function scryptHash(value: string, config: ScryptConfig) {
  const salt = await randomBytesAsync(config.saltSize);
  const hash = await scryptAsync(value, salt, config.keyLength, {
    cost: config.cost,
    blockSize: config.blockSize,
    parallelization: config.parallelization,
    maxmem: config.maxMemory,
  });

  return serializePhc(salt, hash, config);
}

function toInteger(key: keyof ScryptConfig, value?: string | number) {
  if (value === undefined || value === '') {
    return defaultScryptConfig[key];
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed)) {
    throw new ValidationException(`--${flagNames[key]} deve ser um número inteiro`);
  }

  return parsed;
}

function validateRange(key: keyof ScryptConfig, value: number, min: number, max: number) {
  if (value < min || value > max) {
    throw new ValidationException(`--${flagNames[key]} deve estar entre ${min} e ${max}`);
  }
}

function validatePowerOfTwo(cost: number) {
  if (!Number.isInteger(Math.log2(cost))) {
    throw new ValidationException('--cost deve ser uma potência de 2 (ex: 4096, 16384, 32768)');
  }
}

function validateMaxMemory(config: ScryptConfig) {
  const min = 128 * config.cost * config.blockSize + 1;

  if (config.maxMemory < min || config.maxMemory > maxUint32) {
    throw new ValidationException(
      `--max-memory deve estar entre ${min} e ${maxUint32} para --cost ${config.cost} e --block-size ${config.blockSize}. Aumente --max-memory ou reduza --cost/--block-size`,
    );
  }
}

function serializePhc(salt: Buffer, hash: Buffer, config: ScryptConfig) {
  const params = `n=${config.cost},r=${config.blockSize},p=${config.parallelization}`;

  return ['', 'scrypt', params, encodeBase64(salt), encodeBase64(hash)].join('$');
}

function encodeBase64(value: Buffer) {
  return value.toString('base64').replace(/=+$/, '');
}
