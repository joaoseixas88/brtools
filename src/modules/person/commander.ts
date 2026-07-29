import { Command } from 'commander';
import { PersonModule } from '.';

function createAction(action: string) {
  return async (options: Record<string, unknown>) => {
    await new PersonModule().handle(action, options);
  };
}

function appendCommonOptions(command: Command) {
  return command
    .option('-c, --copy', 'Copia o resultado para o clipboard')
    .option('-j, --json', 'Retorna o resultado em JSON')
    .option('-n, --count <count>', 'Quantidade de itens a gerar');
}

function appendFormattableOptions(command: Command) {
  return appendCommonOptions(command).option(
    '-f, --formatted',
    'Formata o dado gerado quando aplicável',
  );
}

export default function (program: Command) {
  const personCommand = program.command('person').description('Gera dados pessoais brasileiros');

  personCommand.action(() => {
    personCommand.outputHelp();
  });

  appendCommonOptions(
    personCommand
      .command('name')
      .description('Gera um nome brasileiro')
      .option('-g, --gender <gender>', 'Gênero do nome: masculino | feminino | m | f'),
  ).action(createAction('name'));

  appendCommonOptions(
    personCommand.command('surname').description('Gera um sobrenome brasileiro'),
  ).action(createAction('surname'));

  appendCommonOptions(
    personCommand
      .command('full-name')
      .description('Gera um nome completo brasileiro')
      .option('-g, --gender <gender>', 'Gênero do nome: masculino | feminino | m | f'),
  ).action(createAction('full-name'));

  appendCommonOptions(
    personCommand
      .command('email')
      .description('Gera um e-mail brasileiro')
      .option('--name <name>', 'Nome completo para derivar o e-mail')
      .option('--first-name <firstName>', 'Primeiro nome para derivar o e-mail')
      .option('--surname <surname>', 'Sobrenome para derivar o e-mail')
      .option('--domain <domain>', 'Domínio customizado para o e-mail'),
  ).action(createAction('email'));

  appendFormattableOptions(personCommand.command('cpf').description('Gera um CPF válido')).action(
    createAction('cpf'),
  );

  appendFormattableOptions(
    personCommand.command('phone').description('Gera um celular brasileiro válido'),
  ).action(createAction('phone'));

  appendFormattableOptions(
    personCommand.command('birthdate').description('Gera uma data de nascimento'),
  ).action(createAction('birthdate'));

  appendCommonOptions(personCommand.command('gender').description('Gera um gênero')).action(
    createAction('gender'),
  );

  appendFormattableOptions(personCommand.command('cep').description('Gera um CEP válido')).action(
    createAction('cep'),
  );

  appendFormattableOptions(
    personCommand.command('address').description('Gera um endereço brasileiro simples'),
  ).action(createAction('address'));

  appendFormattableOptions(personCommand.command('rg').description('Gera um RG plausível')).action(
    createAction('rg'),
  );

  appendFormattableOptions(
    personCommand
      .command('profile')
      .description('Gera um perfil completo')
      .option('--name <name>', 'Nome completo da pessoa em vez de um gerado')
      .option('-g, --gender <gender>', 'Gênero do perfil: masculino | feminino | m | f'),
  ).action(createAction('profile'));
}
