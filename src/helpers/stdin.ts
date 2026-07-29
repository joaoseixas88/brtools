export const STDIN_SENTINEL = '-';

export const isStdinSentinel = (value?: string) => value?.trim() === STDIN_SENTINEL;

export const readStdin = async () => {
  const chunks: Buffer[] = [];

  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string));
  }

  return Buffer.concat(chunks).toString('utf8');
};

export const readStdinLines = async () => {
  const content = await readStdin();

  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
};
