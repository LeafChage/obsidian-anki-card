import type { TFile } from "obsidian";
import type { IObsidianRepository } from "@/obsidian/app";
import { XArray } from "@/x";

/**
 * Fixture shape for seeding LocalRepository — deliberately smaller than
 * TFile since nothing outside obsidian/app.ts and obsidian/x.ts touches
 * TFile fields besides `.name`/`.basename` (see useFlashCards.tsx).
 */
export interface LocalCardFixture {
  basename: string;
  back: string;
  remembered?: boolean;
}

interface LocalCard {
  basename: string;
  back: string;
  remembered: boolean;
}

export const DEFAULT_LOCAL_FIXTURES: LocalCardFixture[] = [
  { basename: "apple", back: "りんご\n\nA common, round fruit with red, green, or yellow skin." },
  { basename: "run", back: "走る (はしる)\n\nTo move at a speed faster than a walk." },
  { basename: "library", back: "図書館 (としょかん)\n\nA place where books are kept for people to read or borrow." },
  { basename: "beautiful", back: "美しい (うつくしい)\n\nPleasing to look at; attractive." },
  { basename: "decision", back: "決断 (けつだん)\n\nA conclusion or resolution reached after consideration." },
  { basename: "already remembered example", back: "This one starts out marked as remembered.", remembered: true },
];

// A fake TFile carries just enough shape for the UI to key off of
// (`.name`/`.basename`); it is never passed through the real `obsidian`
// module, so it's safe to construct as a plain object and cast.
const toTFile = (card: LocalCard): TFile => ({
  path: card.basename,
  name: card.basename,
  basename: card.basename,
  extension: "md",
}) as unknown as TFile;

export class LocalRepository implements IObsidianRepository {
  private readonly cards: LocalCard[];

  public constructor(fixtures: LocalCardFixture[] = DEFAULT_LOCAL_FIXTURES) {
    this.cards = fixtures.map((f) => ({
      basename: f.basename,
      back: f.back,
      remembered: f.remembered ?? false,
    }));
  }

  private findCard = (file: TFile): LocalCard => {
    const card = this.cards.find((c) => c.basename === file.basename);
    if (!card) {
      throw `unknown card: ${file.basename}`;
    }
    return card;
  }

  public findAllFiles = (): TFile[] => {
    return this.cards.map(toTFile);
  }

  public findForgotFiles = (): TFile[] => {
    return XArray.shuffle(this.cards.filter((c) => !c.remembered)).map(toTFile);
  }

  private checkColumn = async (file: TFile, on: boolean): Promise<void> => {
    this.findCard(file).remembered = on;
  }

  public remember = (file: TFile) => {
    return this.checkColumn(file, true);
  }

  public forgot = (file: TFile) => {
    return this.checkColumn(file, false);
  }

  public forgotAll = async (files: TFile[]) => {
    return Promise.all(files.map((f) => this.checkColumn(f, false))).then(() => { });
  }

  public showQuizzFront = (file: TFile): Promise<string> => {
    return Promise.resolve(file.basename);
  }

  public showQuizzBack = (file: TFile): Promise<string> => {
    return Promise.resolve(this.findCard(file).back);
  }
}
