import { GLib } from "astal";
import { StdIOSocketProcess } from "../../utils";

const rustLauncherUtilsPath = GLib.getenv("RUST_LAUNCHER_UTILS_PATH") ?? "";
const rustLauncherUtils: StdIOSocketProcess = new StdIOSocketProcess([rustLauncherUtilsPath]);

export type RinkQueryResult = {
  error: boolean,
  output: string
};
export async function rinkQuery(query: string): Promise<RinkQueryResult> {
  const result = await rustLauncherUtils.sendAsync(`rink ${query}`);
  if(result) return JSON.parse(result);
  return { error: true, output: "" };
}