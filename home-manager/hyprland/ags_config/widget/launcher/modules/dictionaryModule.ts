import { Module, ModuleEntry } from "../module";
import { copyToClipboard } from "../../../utils";
import { execAsync } from "astal";
import { AbortSignal } from "../../../processes";

type DictionaryResponse = DictionaryWord[];
type DictionaryWord = {
  word: string,
  phonetic?: string,
  phonetics?: DictionaryPhonetic[],
  origin?: string,
  meanings: DictionaryMeaning[]
};
type DictionaryPhonetic = {
  text: string,
  audio?: string
};
type DictionaryMeaning = {
  partOfSpeech: string,
  definitions: DictionaryDefinition[]
};
type DictionaryDefinition = {
  definition: string,
  example?: string,
  synonyms?: string[],
  antonyms?: string[]
};

/**
 * Uses the [Free Dictionary API](https://dictionaryapi.dev/) to look up words.
 * API requests are in the format of `https://api.dictionaryapi.dev/api/v2/entries/en/[word]`.
 */
export class DictionaryModule extends Module {
  static DICTIONARY_LOOKUP_PREFIX = "define ";

  constructor() {
    super("Dictionary", "run-dictionary");
  }

  getActive(query: string): boolean {
    return query.startsWith(DictionaryModule.DICTIONARY_LOOKUP_PREFIX);
  }
  async getEntries(query: string, abortSignal: AbortSignal): Promise<ModuleEntry[]> {
    query = query.slice(DictionaryModule.DICTIONARY_LOOKUP_PREFIX.length).trim();

    try {
      // Soup support is a planned feature in Astal, so we just use curl for now:
      // https://github.com/Aylur/astal/blob/main/CONTRIBUTING.md?plain=1#L25

      const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${query}`;
      const response = await execAsync(["curl", "-s", url]);
      if (!response) return [];

      const data: DictionaryResponse = JSON.parse(response);
      if (!data || data.length === 0) return [];

      const word = data[0]; // Only use the first result

      return word.meanings.map(meaning => {
        const title = `${word.word} (${meaning.partOfSpeech})`;
        const description = meaning.definitions.map(def => `- ${def.definition}`).join("\n");
        const textToCopy = `${word.word} (${meaning.partOfSpeech}):\n${meaning.definitions.map(def => def.definition).join("\n")}`;

        return new ModuleEntry(title, description, null, () => copyToClipboard(textToCopy));
      });
    } catch (e) {
      console.error(e);
      return [];
    }
  }
}