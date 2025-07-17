import chalk from 'chalk';

export class Logger {
  error(message: string) {
    console.log(chalk.red(message));
  }

  success(message: string) {
    console.log(chalk.green(message));
  }

  info(message: string) {
    console.log(chalk.blue(message));
  }

  warn(message: string) {
    console.log(chalk.yellow(message));
  }
}

export const logger = new Logger();
