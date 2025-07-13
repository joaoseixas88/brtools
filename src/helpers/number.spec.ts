import { NumbersHelper } from "./numbers";

describe("NumbersHelper", () => {
  it("genRandomNumber should return correct random number size", () => {
    expect(NumbersHelper.genRandomNumber(1)).toHaveLength(1);
    expect(NumbersHelper.genRandomNumber(10)).toHaveLength(10);
    expect(NumbersHelper.genRandomNumber(15)).toHaveLength(15);
    expect(NumbersHelper.genRandomNumber(20)).toHaveLength(20);
  });
});
