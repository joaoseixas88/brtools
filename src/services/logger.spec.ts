import { logger } from './logger';

const withPipedStdout = async (run: (write: jest.Mock) => Promise<void>) => {
  const originalIsTTY = Object.getOwnPropertyDescriptor(process.stdout, 'isTTY');
  const write = jest.fn((_chunk: string, callback: (error?: Error) => void) => {
    callback();
    return true;
  });

  Object.defineProperty(process.stdout, 'isTTY', { value: false, configurable: true });
  const spy = jest.spyOn(process.stdout, 'write').mockImplementation(write as never);

  try {
    await run(write);
  } finally {
    spy.mockRestore();

    if (originalIsTTY) {
      Object.defineProperty(process.stdout, 'isTTY', originalIsTTY);
    }
  }
};

describe('Logger', () => {
  it('should terminate piped output with a newline', async () => {
    await withPipedStdout(async (write) => {
      await logger.result('11144477735');

      expect(write).toHaveBeenCalledWith('11144477735\n', expect.any(Function));
    });
  });

  it('should keep batch output as one trailing newline only', async () => {
    await withPipedStdout(async (write) => {
      await logger.result('11144477735\n86112763702');

      const [written] = write.mock.calls[0];

      expect(written.split('\n').filter(Boolean)).toHaveLength(2);
      expect(written.endsWith('\n')).toBe(true);
      expect(written.endsWith('\n\n')).toBe(false);
    });
  });
});
