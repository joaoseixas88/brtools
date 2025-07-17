import { NewModule } from "../modules/module";
import { makeModule } from "./moduleBuilder";

class FakeModule {
  public handle = jest.fn((arg: string) => `Hello, ${arg}`);
}

describe("Module Builder", () => {
  it("should return bound handle method", () => {
    const handle = makeModule(FakeModule);
    expect(typeof handle).toBe("function");
    const result = handle("World");
    expect(result).toBe("Hello, World");
  });
});
