import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface Config {
  analyticsEnabled?: boolean;
  analyticsAsked?: boolean;
  userId?: string;
}

export class ConfigService {
  private configPath: string;
  private config: Config;

  constructor() {
    const configDir = path.join(os.homedir(), '.brtools');
    this.configPath = path.join(configDir, 'config.json');
    this.ensureConfigDir();
    this.loadConfig();
  }

  private ensureConfigDir() {
    const configDir = path.dirname(this.configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
  }

  private loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf-8');
        this.config = JSON.parse(data);
      } else {
        this.config = {};
      }
    } catch {
      this.config = {};
    }
  }

  private saveConfig() {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch {
      console.warn('Não foi possível salvar as configurações');
    }
  }

  isAnalyticsEnabled(): boolean {
    return this.config.analyticsEnabled === true;
  }

  hasAnalyticsPreference(): boolean {
    return this.config.analyticsAsked === true;
  }

  enableAnalytics() {
    this.config.analyticsEnabled = true;
    this.config.analyticsAsked = true;
    if (!this.config.userId) {
      this.config.userId = this.generateUserId();
    }
    this.saveConfig();
  }

  disableAnalytics() {
    this.config.analyticsEnabled = false;
    this.config.analyticsAsked = true;
    this.saveConfig();
  }

  getUserId(): string {
    if (!this.config.userId) {
      this.config.userId = this.generateUserId();
      this.saveConfig();
    }
    return this.config.userId;
  }

  private generateUserId(): string {
    return (
      'brtools-' +
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  getAnalyticsStatus(): string {
    if (!this.hasAnalyticsPreference()) {
      return 'não configurado';
    }
    return this.isAnalyticsEnabled() ? 'habilitado' : 'desabilitado';
  }
}
