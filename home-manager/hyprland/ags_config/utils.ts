export function limitLength(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 3) + "..." : s;
}