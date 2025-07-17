import { createHash } from 'crypto';
import { ValidationException } from '../../exceptions/Validation';
import { CliModule } from '../module';
import { AlgorithmTypes } from './types';
import { hash } from 'bcrypt';
import fs from 'fs';

type HashOptions = {
  text?: string;
  file?: string;
  salt?: number;
};

export class HashModule extends CliModule {
  override async perform(algorithm: AlgorithmTypes, options: HashOptions): Promise<string> {
    this.validateAlgo(algorithm);
    this.validateOptions(options);

    switch (algorithm) {
      case 'bcrypt':
        return this.bcrypt(options);
      case 'md5':
        return this.md5(options);
      case 'sha256':
        return this.sha256(options);
      case 'sha512':
        return this.sha512(options);
      case 'base64':
        return this.base64(options);
      default:
        throw new ValidationException(`Algorítmo inválido: ${algorithm}`);
    }
  }

  private validateOptions(options: HashOptions) {
    if (!options['text'] && !options['file']) {
      throw new ValidationException(
        'Texto ou arquivo obrigatório. Digite o texto com --text <value> ou o arquivo com --file <value>',
      );
    }
  }

  private validateAlgo(algorithm: string) {
    const availableAlgos = ['bcrypt', 'md5', 'sha256', 'sha512', 'base64'];
    if (!availableAlgos.includes(algorithm)) {
      throw new ValidationException(
        `Algorítmo não encontrado. Disponíveis: < ${availableAlgos.join(' | ')} >`,
      );
    }
  }

  async bcrypt(options: HashOptions) {
    let salt = Number(options.salt);
    if (isNaN(salt) || salt <= 0) {
      salt = 10;
    }
    const hashValue = await hash(options.text, salt);
    return hashValue;
  }

  async md5(options: HashOptions) {
    let input: string;
    if (options.text) {
      input = options.text;
    } else if (options.file) {
      input = fs.readFileSync(options.file, 'utf8');
    } else {
      throw new ValidationException(
        'Texto ou arquivo obrigatório. Digite o texto com --text <value> ou o arquivo com --file <value>',
      );
    }
    const hashValue = createHash('md5').update(input).digest('hex');
    return hashValue;
  }

  async sha256(options: HashOptions) {
    let input: string;
    if (options.text) {
      input = options.text;
    } else if (options.file) {
      input = fs.readFileSync(options.file, 'utf8');
    } else {
      throw new ValidationException(
        'Texto ou arquivo obrigatório. Digite o texto com --text <value> ou o arquivo com --file <value>',
      );
    }
    const hashValue = createHash('sha256').update(input).digest('hex');
    return hashValue;
  }

  async sha512(options: HashOptions) {
    let input: string;
    if (options.text) {
      input = options.text;
    } else if (options.file) {
      input = fs.readFileSync(options.file, 'utf8');
    } else {
      throw new ValidationException(
        'Texto ou arquivo obrigatório. Digite o texto com --text <value> ou o arquivo com --file <value>',
      );
    }
    const hashValue = createHash('sha512').update(input).digest('hex');
    return hashValue;
  }
  private mimeType(filePath: string) {
    console.log(filePath);
  }

  async base64(options: HashOptions) {
    let input: Buffer;
    if (options.text) {
      input = Buffer.from(options.text, 'utf8');
    } else if (options.file) {
      input = fs.readFileSync(options.file);
    } else {
      throw new ValidationException(
        'Texto ou arquivo obrigatório. Digite o texto com --text <value> ou o arquivo com --file <value>',
      );
    }
    const hashValue = input.toString('base64');
    return hashValue;
  }
}
