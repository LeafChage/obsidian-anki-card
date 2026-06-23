export namespace XArray {
  export const shuffle = <T>(items: Array<T>): Array<T> => {
    const result = new Array(...items);
    for (let i = result.length - 1; i > 0; i--) {
      const randomI = Math.floor(Math.random() * i);
      [result[i], result[randomI]] = [result[randomI]!, result[i]!];
    }
    return result;
  }
}
