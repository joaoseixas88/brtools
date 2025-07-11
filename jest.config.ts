/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from "jest";

const config: Config = {
  roots: ["<rootDir>/src"],
  collectCoverage: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: ["<rootDir>/src/**/*.ts"],
  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        jsc: {
          target: "es2021",
        },
      },
    ],
  },
  verbose: true,
  // silent: true,
  extensionsToTreatAsEsm: [".ts"],
};

export default config;
