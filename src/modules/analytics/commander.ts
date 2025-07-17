import { Command } from 'commander';
import { AnalyticsModule } from '.';

export default function (program: Command) {
  program
    .command('analytics')
    .description('Gerencia configurações de analytics')
    .option('--enable', 'Habilita coleta de dados anônimos')
    .option('--disable', 'Desabilita coleta de dados')
    .option('--status', 'Mostra status atual dos analytics')
    .action((options) => {
      const analyticsModule = new AnalyticsModule();
      analyticsModule.handle(options);
    });
}
