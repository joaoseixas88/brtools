import { PostHog } from 'posthog-node';
import { ConfigService } from './config';
import { Logger } from './logger';
import * as readline from 'readline';

interface AnalyticsEvent {
  event: string;
  command?: string;
  options?: string[];
  error?: string;
  duration?: number;
  version?: string;
  platform?: string;
}

export class AnalyticsService {
  private client: PostHog | null = null;
  private config: ConfigService;
  private logger: Logger;

  constructor() {
    this.config = new ConfigService();
    this.logger = new Logger();

    if (this.config.isAnalyticsEnabled()) {
      this.initializeClient();
    }
  }

  private initializeClient() {
    try {
      // PostHog público para desenvolvimento - substitua pela sua chave
      this.client = new PostHog(
        'phc_test_key_brtools', // Substitua por sua chave real
        {
          host: 'https://app.posthog.com',
          flushAt: 1,
          flushInterval: 0,
        },
      );
    } catch {
      // Se falhar, continua sem analytics
      this.client = null;
    }
  }

  async trackCommand(command: string, options: Record<string, unknown>, duration?: number) {
    if (!this.shouldTrack()) return;

    const event: AnalyticsEvent = {
      event: 'command_executed',
      command,
      options: Object.keys(options).filter((key) => options[key] !== undefined),
      duration,
      version: process.env.npm_package_version || 'unknown',
      platform: process.platform,
    };

    await this.sendEvent(event);
  }

  async trackError(command: string, error: string) {
    if (!this.shouldTrack()) return;

    const event: AnalyticsEvent = {
      event: 'command_error',
      command,
      error: this.sanitizeError(error),
      version: process.env.npm_package_version || 'unknown',
      platform: process.platform,
    };

    await this.sendEvent(event);
  }

  async trackFirstRun() {
    if (!this.shouldTrack()) return;

    const event: AnalyticsEvent = {
      event: 'first_run',
      version: process.env.npm_package_version || 'unknown',
      platform: process.platform,
    };

    await this.sendEvent(event);
  }

  private async sendEvent(event: AnalyticsEvent) {
    if (!this.client) return;

    try {
      this.client.capture({
        distinctId: this.config.getUserId(),
        event: event.event,
        properties: {
          ...event,
          timestamp: new Date().toISOString(),
        },
      });

      await this.client.flush();
    } catch {
      // Falha silenciosa - analytics não deve quebrar a CLI
    }
  }

  private shouldTrack(): boolean {
    return this.config.isAnalyticsEnabled() && this.client !== null;
  }

  private sanitizeError(error: string): string {
    // Remove informações sensíveis do erro
    return error
      .replace(/\/Users\/[^/]+/g, '/Users/***')
      .replace(/\/home\/[^/]+/g, '/home/***')
      .replace(/\\Users\\[^\\]+/g, '\\Users\\***')
      .replace(/[0-9]{3}\.?[0-9]{3}\.?[0-9]{3}-?[0-9]{2}/g, '***CPF***')
      .replace(/[0-9]{2}\.?[0-9]{3}\.?[0-9]{3}\/?[0-9]{4}-?[0-9]{2}/g, '***CNPJ***')
      .substring(0, 200); // Limita tamanho
  }

  async showAnalyticsPrompt(): Promise<boolean> {
    // Usando readline importado
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('\n' + '='.repeat(60));
    this.logger.info('🔍 Analytics Opcionais - BRTools');
    console.log('='.repeat(60));
    console.log();
    console.log('Para melhorar o BRTools, gostaríamos de coletar dados anônimos de uso.');
    console.log();
    this.logger.warn('📊 Dados coletados:');
    console.log('  • Comandos utilizados (sem valores sensíveis)');
    console.log('  • Sistema operacional');
    console.log('  • Frequência de uso');
    console.log('  • Erros (sem dados pessoais)');
    console.log();
    this.logger.warn('🔒 Dados NÃO coletados:');
    console.log('  • CPFs, CNPJs ou textos processados');
    console.log('  • Informações pessoais');
    console.log('  • Caminhos de arquivos completos');
    console.log();
    console.log('Você pode alterar isso a qualquer momento com:');
    console.log('  brtools analytics enable/disable');
    console.log();

    return new Promise((resolve) => {
      rl.question('Aceita participar? (s/n): ', (answer) => {
        rl.close();
        const accepted = answer.toLowerCase().startsWith('s');

        if (accepted) {
          this.config.enableAnalytics();
          this.initializeClient();
          this.logger.success(
            '✅ Analytics habilitados! Obrigado por ajudar a melhorar o BRTools.',
          );
        } else {
          this.config.disableAnalytics();
          this.logger.info(
            '📊 Analytics desabilitados. Você pode habilitar depois com: brtools analytics enable',
          );
        }

        console.log();
        resolve(accepted);
      });
    });
  }

  getStatus(): string {
    return this.config.getAnalyticsStatus();
  }

  enable() {
    this.config.enableAnalytics();
    this.initializeClient();
  }

  disable() {
    this.config.disableAnalytics();
    this.client = null;
  }
}
