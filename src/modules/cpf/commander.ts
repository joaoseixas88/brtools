import { Command } from 'commander';
import { Cpf } from '.';
import { makeModule } from '../../helpers/moduleBuilder';

export default function (program: Command) {
  program
    .command('cpf')
    .description('Gera ou valida um CPF')
    .option('-g, --generate', 'Gerar um CPF válido')
    .option('-v, --validate <cpf>', 'Validar um CPF informado (use - para ler do stdin)')
    .option('-d, --digits <digits>', 'Digitos verificadores do CPF (use - para ler do stdin)')
    .option('-c, --copy', 'Copia o CPF gerado/validado para o clipboard')
    .option('-f, --formatted', 'Formata o cpf criado')
    .option('-j, --json', 'Retorna o resultado em JSON')
    .option('-n, --count <count>', 'Quantidade de CPFs a gerar')
    .action(makeModule(Cpf));
}
