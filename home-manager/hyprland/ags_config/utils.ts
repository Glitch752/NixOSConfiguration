import { Gio, GLib } from "astal";
import { Gdk, Gtk } from "astal/gtk3";

export function limitLength(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 3) + "..." : s;
}

export function formatDuration(duration: number) {
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function copyToClipboard(text: string) {
  const display = Gdk.Display.get_default();
  if(!display) return;
  const clipboard = Gtk.Clipboard.get_default(display);
  
  clipboard.set_text(text, -1);
  clipboard.store();
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
Gio._promisify(Gio.OutputStream.prototype, "write_bytes_async");
Gio._promisify(Gio.DataInputStream.prototype, "read_line_async");
Gio._promisify(Gio.DataInputStream.prototype, "fill_async");
Gio._promisify(Gio.DataInputStream.prototype, "skip_async");

// The Typescript definitions for GLib.Bytes are incorrect; it can accept a string.
// We can't augment the type definition, so this is just a small helper.
const Bytes = (s: string) => new GLib.Bytes(s as any);

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

export class StdIOSocketProcess {
  private process: Gio.Subprocess;
  private stdin: Gio.OutputStream;
  private stdout: Gio.DataInputStream;
  private stderr: Gio.DataInputStream;

  constructor(args: string[]) {
    this.process = new Gio.Subprocess({
      argv: args,
      flags: Gio.SubprocessFlags.STDIN_PIPE | Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
    });
    this.process.init(null);

    this.stdin = this.process.get_stdin_pipe()!;
    this.stdout = new Gio.DataInputStream({
      baseStream: this.process.get_stdout_pipe()!,
      closeBaseStream: true
    });
    this.stderr = new Gio.DataInputStream({
      baseStream: this.process.get_stderr_pipe()!,
      closeBaseStream: true
    });
  }

  async write_stdin_async(data: string, cancellable: Gio.Cancellable) {
    try {
      await this.stdin.write_bytes_async(Bytes(`${data}\n`), GLib.PRIORITY_DEFAULT, cancellable);
    } catch(e) {
      if(!(e instanceof GLib.Error) || e.code !== Gio.IOErrorEnum.CANCELLED) print(`Error writing to stdin: ${e}`);
    }
  }

  private activeRead: Gio.Cancellable | null = null;

  async sendAsync(data: string): Promise<string | null> {
    if(this.activeRead) {
      this.activeRead.cancel();
      this.activeRead = null;
    }

    const cancellable = new Gio.Cancellable();
    this.activeRead = cancellable;

    // Clear the stdout buffer
    if(this.stdout.get_available() > 0) {
      await this.stdout.skip_async(this.stdout.get_available(), GLib.PRIORITY_DEFAULT, cancellable);
      if(cancellable.is_cancelled()) return null;
    }

    await this.write_stdin_async(data, cancellable);
    if(cancellable.is_cancelled()) return null;
    // const stdout = await this.read_stdout_line_async();
    
    const ANSI_BLUE = "\x1b[34m";
    const ANSI_RESET = "\x1b[0m";

    await this.stdout.fill_async(-1, GLib.PRIORITY_DEFAULT, cancellable);
    if(cancellable.is_cancelled()) return null;

    const bytes = this.stdout.peek_buffer();
    const text = new TextDecoder().decode(bytes);
    print(ANSI_BLUE, text, ANSI_RESET);

    const [lineBytes] = await this.stdout.read_line_async(GLib.PRIORITY_DEFAULT, cancellable);
    if(cancellable.is_cancelled()) return null;
    if(!lineBytes) return null;

    const line = new TextDecoder().decode(lineBytes);

    return line;
  }

  close() {
    this.process.force_exit();
  }
}

Array.prototype.defaultIfEmpty = function<T>(defaultValue: T): T[] {
  return this.length > 0 ? this : [defaultValue];
}
Array.prototype.all = function<T>(predicate: (value: T) => boolean): boolean {
  for(let value of this) {
    if(!predicate(value)) return false;
  }
  return true;
}
Array.prototype.any = function<T>(predicate: (value: T) => boolean): boolean {
  for(let value of this) {
    if(predicate(value)) return true;
  }
  return false;
}
declare global {
  interface Array<T> {
    defaultIfEmpty(defaultValue: T): T[];
    all(predicate: (value: T) => boolean): boolean;
    any(predicate: (value: T) => boolean): boolean;
  }
}