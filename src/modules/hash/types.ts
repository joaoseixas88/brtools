export const availableAlgorithms = [
  'bcrypt',
  'scrypt',
  'md5',
  'sha256',
  'sha512',
  'base64',
] as const;

export type AlgorithmTypes = (typeof availableAlgorithms)[number];
