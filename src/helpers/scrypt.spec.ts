import { scryptSync } from 'crypto';
import { defaultScryptConfig, resolveScryptConfig, ScryptConfig, scryptHash } from './scrypt';

const parsePhc = (value: string) => {
  const [, id, params, salt, hash] = value.split('$');

  return {
    id,
    params,
    salt: Buffer.from(salt, 'base64'),
    hash: Buffer.from(hash, 'base64'),
  };
};

const recompute = (value: string, salt: Buffer, config: ScryptConfig) =>
  scryptSync(value, salt, config.keyLength, {
    cost: config.cost,
    blockSize: config.blockSize,
    parallelization: config.parallelization,
    maxmem: config.maxMemory,
  });

describe('scrypt helper', () => {
  describe('scryptHash', () => {
    it('should serialize a phc string with the adonis defaults', async () => {
      const result = await scryptHash('secret', defaultScryptConfig);

      expect(result).toMatch(/^\$scrypt\$n=16384,r=8,p=1\$[A-Za-z0-9+/]+\$[A-Za-z0-9+/]+$/);
    });

    it('should use a 16 bytes salt and a 64 bytes hash', async () => {
      const { salt, hash } = parsePhc(await scryptHash('secret', defaultScryptConfig));

      expect(salt).toHaveLength(defaultScryptConfig.saltSize);
      expect(hash).toHaveLength(defaultScryptConfig.keyLength);
    });

    it('should produce a hash that can be recomputed from the embedded salt', async () => {
      const config = resolveScryptConfig({ cost: 1024 });
      const { salt, hash } = parsePhc(await scryptHash('secret', config));

      expect(recompute('secret', salt, config).equals(hash)).toBe(true);
      expect(recompute('other', salt, config).equals(hash)).toBe(false);
    });

    it('should reflect custom parameters in the phc header', async () => {
      const config = resolveScryptConfig({
        cost: '4096',
        blockSize: '4',
        parallelization: '2',
        saltSize: '32',
        keyLength: '128',
      });
      const result = await scryptHash('secret', config);
      const { params, salt, hash } = parsePhc(result);

      expect(params).toBe('n=4096,r=4,p=2');
      expect(salt).toHaveLength(32);
      expect(hash).toHaveLength(128);
    });

    it('should generate a different salt on every call', async () => {
      const config = resolveScryptConfig({ cost: 1024 });

      const [first, second] = await Promise.all([
        scryptHash('secret', config),
        scryptHash('secret', config),
      ]);

      expect(first).not.toBe(second);
    });
  });

  describe('resolveScryptConfig', () => {
    it('should fall back to the adonis defaults', () => {
      expect(resolveScryptConfig()).toEqual(defaultScryptConfig);
      expect(resolveScryptConfig({})).toEqual(defaultScryptConfig);
    });

    it('should coerce string values coming from the cli', () => {
      expect(resolveScryptConfig({ cost: '4096', saltSize: '24' })).toEqual({
        ...defaultScryptConfig,
        cost: 4096,
        saltSize: 24,
      });
    });

    it('should reject non integer values', () => {
      expect(() => resolveScryptConfig({ cost: '1.5' })).toThrow(/--cost.*inteiro/);
      expect(() => resolveScryptConfig({ blockSize: 'abc' })).toThrow(/--block-size.*inteiro/);
    });

    it('should reject a cost that is not a power of two', () => {
      expect(() => resolveScryptConfig({ cost: '3000' })).toThrow(/potência de 2/);
    });

    it('should reject values outside the supported ranges', () => {
      expect(() => resolveScryptConfig({ keyLength: '32' })).toThrow(
        '--key-length deve estar entre 64 e 128',
      );
      expect(() => resolveScryptConfig({ saltSize: '4' })).toThrow(
        '--salt-size deve estar entre 8 e 1024',
      );
      expect(() => resolveScryptConfig({ cost: '1' })).toThrow(/--cost deve estar entre 2/);
    });

    it('should reject a max memory that is too low for the chosen cost', () => {
      expect(() => resolveScryptConfig({ cost: '1048576' })).toThrow(/--max-memory/);
      expect(() => resolveScryptConfig({ cost: '1048576', maxMemory: '1073741825' })).not.toThrow();
    });
  });
});
