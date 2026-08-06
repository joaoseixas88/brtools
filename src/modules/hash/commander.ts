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
    .option('--cost <cost>', 'scrypt: fator de custo N, potência de 2 (padrão 16384)')
    .option('--block-size <blockSize>', 'scrypt: tamanho do bloco r (padrão 8)')
    .option('--parallelization <parallelization>', 'scrypt: paralelização p (padrão 1)')
    .option('--salt-size <saltSize>', 'scrypt: bytes do salt aleatório, 8 a 1024 (padrão 16)')
    .option('--key-length <keyLength>', 'scrypt: bytes do hash, 64 a 128 (padrão 64)')
    .option('--max-memory <maxMemory>', 'scrypt: limite de memória em bytes (padrão 33554432)')
    .action(makeModule(HashModule));
}
