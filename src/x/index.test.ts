import { describe, expect, test } from "bun:test";
import { XArray } from "./";

describe("array", () => {
  test("shuffle", () => {
    const items = [1, 2, 3, 4, 5];
    const shuffled = XArray.shuffle(items);
    expect(items).toEqual([1, 2, 3, 4, 5])
    expect(shuffled).toBeArray()
    expect(shuffled.length).toBe(items.length)
    // expect(shuffled).not.toEqual(items)
  })
})
