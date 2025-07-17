import { ValidationException } from '../../exceptions/Validation';
import { NewModule } from '../module';
import { AlgorithmTypes } from './types';
import { hash } from 'bcrypt';

export class HashModule extends NewModule {
  override async perform(
    algorithm: AlgorithmTypes,
    options: Record<string, unknown>,
  ): Promise<string> {
    this.validateAlgo(algorithm);
    this.validateOptions(options);
    let response = '';
    if (algorithm === 'bcrypt') {
      response = await this.bcrypt(options as { text: string; salt?: number });
    }
    return response;
  }

  private validateOptions(options: Record<string, unknown>) {
    if (!options['text']) {
      throw new ValidationException('Texto obrigatório. Digite o texto com --text <value>');
    }
  }

  private validateAlgo(algorithm: string) {
    const availableAlgos = ['bcrypt'];
    if (!availableAlgos.includes(algorithm)) {
      throw new ValidationException('Algorítmo não encontrado');
    }
  }

  async bcrypt(options: { text: string; salt?: number }) {
    let salt = Number(options.salt);
    if (isNaN(salt) || salt <= 0) {
      salt = 10;
    }
    const hashValue = await hash(options.text, salt);
    return hashValue;
  }
}
