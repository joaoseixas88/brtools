import { Command } from 'commander';
import { CnpjModule } from '.';
import { makeModule } from '../../helpers/moduleBuilder';

export default function (program: Command) {
  program
    .command('cnpj')
    .description('Gera ou valida um CNPJ')
    .option('-g, --generate', 'Gerar um CNPJ válido')
    .option('-v, --validate <cnpj>', 'Validar um CNPJ informado (use - para ler do stdin)')
    .option('-d, --digits <digits>', 'Digitos verificadores do CNPJ (use - para ler do stdin)')
    .option('-c, --copy', 'Copia o CNPJ gerado/validado para o clipboard')
    .option('-f, --formatted', 'Formata o CNPJ criado')
    .option('-j, --json', 'Retorna o resultado em JSON')
    .option('-n, --count <count>', 'Quantidade de CNPJs a gerar')
    .action(makeModule(CnpjModule));
}
