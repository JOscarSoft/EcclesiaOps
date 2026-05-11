import { Injectable, NotFoundException } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

interface BookEntry {
  testament: string;
  title: string;
  shortTitle: string;
  abbr: string;
  category: string;
  key: string;
  number: number;
  chapters: number;
  verses: number;
}

@Injectable()
export class BibleService {
  private readonly bibleDir: string;

  constructor() {
    this.bibleDir = join(__dirname, '..', '..', '..', 'bible');
  }

  getBookList(): BookEntry[] {
    const filePath = join(this.bibleDir, '_index.json');
    const raw = readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  }

  getVerse(bookKey: string, chapter: number, verse: number): { verse: string; reference: string } {
    const books = this.getBookList();
    const book = books.find((b) => b.key === bookKey);
    if (!book) {
      throw new NotFoundException(`Libro "${bookKey}" no encontrado`);
    }

    const filePath = join(this.bibleDir, `${bookKey}.json`);
    let data: string[][];
    try {
      const raw = readFileSync(filePath, 'utf-8');
      data = JSON.parse(raw);
    } catch {
      throw new NotFoundException(`Archivo del libro "${bookKey}" no encontrado`);
    }

    const chapterIndex = chapter - 1;
    const verseIndex = verse - 1;

    if (chapterIndex < 0 || chapterIndex >= data.length) {
      throw new NotFoundException(`Capítulo ${chapter} no encontrado en ${book.title}`);
    }

    if (verseIndex < 0 || verseIndex >= data[chapterIndex].length) {
      throw new NotFoundException(`Versículo ${verse} no encontrado en ${book.title} capítulo ${chapter}`);
    }

    return {
      verse: data[chapterIndex][verseIndex],
      reference: `${book.shortTitle} ${chapter}:${verse}`,
    };
  }
}
