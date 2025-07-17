import { AnalyticsService } from '../../services/analytics';
import { Logger } from '../../services/logger';

export class AnalyticsModule {
  private analyticsService: AnalyticsService;
  private logger: Logger;

  constructor() {
    this.analyticsService = new AnalyticsService();
    this.logger = new Logger();
  }

  handle(options: { enable?: boolean; disable?: boolean; status?: boolean }): void {
    if (options.enable) {
      this.analyticsService.enable();
      this.logger.success('✅ Analytics habilitados!');
      console.log('Os dados anônimos de uso agora serão coletados para melhorar o BRTools.');
      return;
    }

    if (options.disable) {
      this.analyticsService.disable();
      this.logger.info('📊 Analytics desabilitados.');
      console.log('Nenhum dado será mais coletado.');
      return;
    }

    if (options.status) {
      const status = this.analyticsService.getStatus();
      this.logger.info(`📊 Status dos Analytics: ${status}`);

      if (status === 'não configurado') {
        console.log('\nPara configurar:');
        console.log('  brtools analytics enable  - Habilita analytics');
        console.log('  brtools analytics disable - Desabilita analytics');
      }
      return;
    }

    // Se nenhuma opção foi passada, mostra ajuda
    this.logger.info('📊 Gerenciamento de Analytics - BRTools');
    console.log('\nComandos disponíveis:');
    console.log('  brtools analytics enable   - Habilita coleta de dados anônimos');
    console.log('  brtools analytics disable  - Desabilita coleta de dados');
    console.log('  brtools analytics status   - Mostra status atual');
    console.log('\nOs analytics ajudam a melhorar o BRTools coletando dados anônimos de uso.');
  }
}
