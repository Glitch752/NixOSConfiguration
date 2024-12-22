import { Gio, GLib } from "astal";

export function limitLength(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 3) + "..." : s;
}

export function formatDuration(duration: number) {
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/** An incredibly simple abort signal implementation. */
export class AbortSignal {
  private listeners: (() => void)[] = [];
  public aborted = false;

  listen(listener: () => void) {
    this.listeners.push(listener);
  }

  abort() {
    for(let listener of this.listeners) {
      listener();
    }
    this.aborted = true;
  }
}

Gio._promisify(Gio.Subprocess.prototype, "communicate_utf8_async");

/**
 * Execute a command asynchronously, while allowing it to be aborted.
 */
export async function abortableExecAsync(args: string[], abortSignal: AbortSignal): Promise<{
  stdout: string,
  stderr: string,
  status: number
} | null> {
  const cancellable = new Gio.Cancellable();
  abortSignal.listen(() => cancellable.cancel());

  let cancelId = 0;
  let flags = Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE;

  const process = new Gio.Subprocess({ argv: args, flags });
  process.init(cancellable);

  if(cancellable instanceof Gio.Cancellable) cancelId = cancellable.connect(() => process.force_exit());

  try {
    const [stdout, stderr] = await process.communicate_utf8_async(null, cancellable);
    const status = process.get_exit_status();

    return { stdout, stderr, status };
  } catch(e) {
    if(!(e instanceof GLib.Error) || e.code !== Gio.IOErrorEnum.CANCELLED)
      print(`Error executing command ${args.join(" ")}: ${e}`);
    return null;
  } finally {
    if(cancelId > 0) cancellable.disconnect(cancelId);
  }
}

Array.prototype.defaultIfEmpty = function<T>(defaultValue: T): T[] {
  return this.length > 0 ? this : [defaultValue];
}
declare global {
  interface Array<T> {
    defaultIfEmpty(defaultValue: T): T[];
  }
}