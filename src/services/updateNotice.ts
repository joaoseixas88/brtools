import fs from 'fs';
import os from 'os';
import path from 'path';
import { logger } from './logger';

const checkIntervalMs = 24 * 60 * 60 * 1000;
const requestTimeoutMs = 1500;

const cacheFile = () => path.join(os.homedir(), '.cache', 'brtools', 'update-check.json');

const isSuppressed = () =>
  Boolean(process.env.NO_UPDATE_NOTIFIER) ||
  Boolean(process.env.CI) ||
  !process.stdout.isTTY ||
  !process.stderr.isTTY;

const readCache = (): { checkedAt: number; latest?: string } | null => {
  try {
    return JSON.parse(fs.readFileSync(cacheFile(), 'utf8'));
  } catch {
    return null;
  }
};

const writeCache = (latest?: string) => {
  try {
    const file = cacheFile();
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify({ checkedAt: Date.now(), latest }), 'utf8');
  } catch {
    return;
  }
};

const fetchLatest = async (name: string) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    const response = await fetch(`https://registry.npmjs.org/${name.replace('/', '%2F')}/latest`, {
      signal: controller.signal,
    });

    if (!response.ok) {
      return undefined;
    }

    const payload = (await response.json()) as { version?: string };

    return payload?.version;
  } catch {
    return undefined;
  } finally {
    clearTimeout(timeout);
  }
};

const isNewer = (latest: string, current: string) => {
  const toParts = (value: string) => value.split('-')[0].split('.').map(Number);
  const [a, b] = [toParts(latest), toParts(current)];

  for (let index = 0; index < Math.max(a.length, b.length); index++) {
    const diff = (a[index] ?? 0) - (b[index] ?? 0);
    if (diff !== 0) {
      return diff > 0;
    }
  }

  return false;
};

const notify = (latest: string, current: string, name: string) => {
  logger.warn(`Nova versão disponível: ${current} → ${latest}`);
  logger.info(`Atualize com: npm install -g ${name}@latest`);
};

export const checkForUpdate = async (name: string, current: string) => {
  if (isSuppressed()) {
    return;
  }

  const cache = readCache();

  if (cache && Date.now() - cache.checkedAt < checkIntervalMs) {
    if (cache.latest && isNewer(cache.latest, current)) {
      notify(cache.latest, current, name);
    }
    return;
  }

  const latest = await fetchLatest(name);
  writeCache(latest);

  if (latest && isNewer(latest, current)) {
    notify(latest, current, name);
  }
};
