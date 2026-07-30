import { Command } from 'commander';
import { HashModule } from '.';
import { makeModule } from '../../helpers/moduleBuilder';

export default function (program: Command) {
  program
    .command('hash')
    .argument('<algorithm>', 'Algoritmo de hash')
    .description('Gera um hash com algoritmo de sua escolha')
    .option('-t, --text <text>', 'Texto a ser hasheado (use - para ler do stdin)')
    .option(
      '-p, --password [length]',
      'Gera uma senha forte e a hasheia; tamanho de 8 a 64 (padrão 12)',
    )
    .option('-c, --copy', 'Copia o resultado para o clipboard')
    .option('-s, --salt <salt>', 'Salt, caso o algoritmo seja bcrypt')
    .option('-f, --file <file>', 'Arquivo a ser hasheado')
    .option('-j, --json', 'Retorna o resultado em JSON')
    .action(makeModule(HashModule));
}
