export const __dummy = {}; // keeps the module so it is not tree-shaken

export type ValueOf<T> = T[keyof T];
