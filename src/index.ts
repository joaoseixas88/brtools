#!/usr/bin/env node

import { ProgramStarter } from './commander';
import { ConfigService } from './services/config';
import { AnalyticsService } from './services/analytics';

async function main() {
  const config = new ConfigService();

  // Se é a primeira execução e não há preferência de analytics, mostra prompt
  if (!config.hasAnalyticsPreference()) {
    const analytics = new AnalyticsService();
    const accepted = await analytics.showAnalyticsPrompt();

    if (accepted) {
      await analytics.trackFirstRun();
    }
  }

  new ProgramStarter().start();
}

main().catch(console.error);
