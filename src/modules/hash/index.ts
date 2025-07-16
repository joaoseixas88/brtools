import { ValidationException } from "../../exceptions/Validation";
import { logger } from "../../services/logger";
import { NewModule } from "../module";
import {hash} from 'bcryptjs'

type AlgorithmTypes = "bcrypt";
export class HashModule extends NewModule {
  override async perform(
    algorithm: AlgorithmTypes,
    options: Record<string, any>
  ): Promise<string> {
    this.validateAlgo(algorithm)
    this.validateOptions(options)
    let response = ''
    if(algorithm === 'bcrypt'){
      response = await this.bcrypt(options)
    }
    return response
  }

  private validateOptions(options: object){
    if(!options.hasOwnProperty('text')){
      throw new ValidationException('Texto obrigatório. Digite o texto com --text <value>')
    }
  }

  private validateAlgo(algorithm: string){
    const availableAlgos = ['bcrypt']
    if(!availableAlgos.includes(algorithm)) {
      throw new ValidationException('Algorítmo não encontrado')
    }
  }
  
  async bcrypt(options: Record<string, any>) {
    const salt = options.salt? Number(options.salt) : 10
    const hashValue = await hash(options.text,salt)
    return hashValue
  }
}
