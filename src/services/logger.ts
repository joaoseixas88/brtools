import chalk from 'chalk';

export class Logger {
  error(message: string) {
    console.error(chalk.stderr.red(message));
  }

  success(message: string) {
    console.error(chalk.stderr.green(message));
  }

  info(message: string) {
    console.error(chalk.stderr.blue(message));
  }

  warn(message: string) {
    console.error(chalk.stderr.yellow(message));
  }

  async result(value: string) {
    if (process.stdout.isTTY) {
      console.log(chalk.blue(value));
      return;
    }
    await new Promise<void>((resolve, reject) => {
      process.stdout.write(value, (error) => (error ? reject(error) : resolve()));
    });
  }
}

export const logger = new Logger();
