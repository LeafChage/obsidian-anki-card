import type { OfferableSetting } from "@/main";
import type { App, TFile } from "obsidian";
import { File } from "./x";
import { XArray } from "@/x";

export interface IObsidianRepository {
  findAllFiles: () => TFile[],
  findForgotFiles: () => TFile[],
  remember: (file: TFile) => Promise<void>,
  forgot: (file: TFile) => Promise<void>,
  forgotAll: (file: TFile[]) => Promise<void>,
  showQuizzFront: (file: TFile) => Promise<string>,
  showQuizzBack: (file: TFile) => Promise<string>,
}

export class ObsidianRepository implements IObsidianRepository {
  public constructor(
    private readonly app: App,
    private readonly plugin: OfferableSetting,
  ) {
  }

  public findAllFiles = (): TFile[] => {
    const promptDir = this.app.vault.getAbstractFileByPath(this.plugin.settings.quizzDirectory ?? "");
    if (!File.isFolder(promptDir)) {
      return [];
    }
    return File.loadFilesInFolder(promptDir);
  }

  public findForgotFiles = (): TFile[] => {
    const column = this.plugin.settings.column;
    if (column === undefined) {
      return [];
    }
    return XArray.shuffle(this.findAllFiles().filter((file) => {
      const cache = this.app.metadataCache.getFileCache(file);
      return cache?.frontmatter?.[column] === false;
    }))
  }

  private checkColumn = async (
    file: TFile,
    on: boolean
  ): Promise<void> => {
    const column = this.plugin.settings.column;
    if (column !== undefined) {
      await this.app.fileManager.processFrontMatter(file, (fm) => {
        console.log(column, on);
        fm[column] = on;
      });
    } else {
      throw "the column to check memorizing is not defined"
    }
  }

  public remember = (file: TFile) => {
    return this.checkColumn(file, true);
  }

  public forgot = (file: TFile) => {
    return this.checkColumn(file, false);
  }

  public forgotAll = async (files: TFile[]) => {
    return Promise.all(
      files.map(f => this.checkColumn(f, false))
    ).then(() => { });
  }

  public showQuizzFront = (file: TFile): Promise<string> => {
    return new Promise((f, _) => f(file.basename));
  }

  public showQuizzBack = (file: TFile): Promise<string> => {
    return this.app.vault.read(file);
  }
}

