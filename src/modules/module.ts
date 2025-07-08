export abstract class CliModule {
  abstract handle(options: any): CliModule.Result;
}

export namespace CliModule {
  export type Result = string;
}
