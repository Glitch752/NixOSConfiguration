import { Module, ModuleEntry } from "../module";
import { copyToClipboard } from "../../../utils";
import Gio from "gi://Gio";
import { closeOpenPopup, PopupData } from "../../../popups";
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

export class InputListModule extends Module {
  private lines: string[];
  private respond: (response: string) => void;

  constructor(data: PopupData) {
    super(data.input, "run-list");

    // The input is a newline-separated list of items in /tmp/launcherList.txt
    try {
      const input = Gio.File.new_for_path("/tmp/launcherList.txt").load_contents(null)[1].toString();
      this.lines = input.split("\n").map(line => line.trim()).filter(line => line.length > 0);
    } catch (e) {
      data.respond("Error reading launcher list");
      this.lines = [];
    }

    this.respond = data.respond;
  }

  getEntries(query: string, abortSignal: AbortSignal): ModuleEntry[] {
    const scores = this.lines.map(line => ({ line, score: fuzzyMatch(query, line) }));
    scores.sort((a, b) => b.score - a.score);

    return scores.map(({ line }) => new ModuleEntry(line, null, null, () => {
      this.respond(line);
      closeOpenPopup();
    }));
  }
}

/**
 * Scores a match based on the query and text.  
 * This isn't a very good algorithm, but it's good enough for now.
 * @param query 
 * @param text 
 */
function fuzzyMatch(query: string, text: string): number {
  const queryWords = query.toLowerCase().split(" ");
  const textWords = text.toLowerCase().split(" ");

  let score = 0;
  for (let queryWord of queryWords) {
    // Rank based on how much of any query words are in the text
    for (let textWord of textWords) {
      if (textWord.startsWith(queryWord)) {
        score += queryWord.length / textWord.length;
      } else if (textWord.includes(queryWord)) {
        score += queryWord.length / textWord.length / 2;
      } else if (queryWord.includes(textWord)) {
        score += textWord.length / queryWord.length / 2;
      }
    }
  }

  return score;
}