export abstract class CliModule<Type = Record<string, any>> {
  abstract handle(options: Type): CliModule.Result;
  abstract validateParams(...args: any[]): any;
}

export namespace CliModule {
  export type Result = string;
}
