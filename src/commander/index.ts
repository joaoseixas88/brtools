#!/usr/bin/env node

import { Command, program } from 'commander';
import { readdir } from 'fs/promises';
import path from 'path';
import { description, name, version } from '../../package.json';

export class ProgramStarter {
  isCommanderFile(path: string) {
    return path.endsWith('commander.ts') || path.endsWith('commander.js');
  }
  async buildOptions(commander: Command) {
    const baseDir = path.join(__dirname, '..', 'modules');
    const directories = await readdir(baseDir, { recursive: true });
    for (const file of directories) {
      const fullPath = `${baseDir}/${file}`;
      if (this.isCommanderFile(fullPath)) {
        (await import(fullPath)).default(commander);
      }
    }
  }

  async start() {
    await this.buildOptions(program);
    program
      .name(name)
      .version(version)
      .description(description || 'A CLI tool to help you with your daily tasks');
    program.parse(process.argv);
  }
}
