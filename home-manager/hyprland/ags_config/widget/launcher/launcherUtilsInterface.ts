import { StdIOSocketProcess } from "../../utils";

const rustLauncherUtils: StdIOSocketProcess = new StdIOSocketProcess(["rust_launcher_utils"]);

export type RinkQueryResult = {
  error: boolean,
  output: string
};
export async function rinkQuery(query: string): Promise<RinkQueryResult> {
  const result = await rustLauncherUtils.sendAsync(`rink ${query}`);
  if(result) return JSON.parse(result);
  return { error: true, output: "" };
}

export type SymbolsQueryResult = {
  error: boolean,
  output: {
    name: string,
    value: string
  }[]
}
export async function symbolsQuery(query: string): Promise<SymbolsQueryResult> {
  const result = await rustLauncherUtils.sendAsync(`symbols ${query}`);
  if(result) return JSON.parse(result);
  return { error: true, output: [] };
}