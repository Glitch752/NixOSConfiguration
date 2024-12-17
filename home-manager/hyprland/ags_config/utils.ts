export function limitLength(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 3) + "..." : s;
}

export function formatDuration(duration: number) {
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}