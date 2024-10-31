import { LayeredCanvas, Paper, Viewport } from './lib/layeredCanvas/system/layeredCanvas';
import { FloorLayer } from './lib/layeredCanvas/layers/floorLayer';
import { ArrayLayer } from './lib/layeredCanvas/layers/arrayLayer';
import type { Book, Page, WrapMode, ReadingDirection } from './lib/book/book';
import { PaperRendererLayer } from './lib/layeredCanvas/layers/paperRendererLayer';
import { FocusKeeper } from './lib/layeredCanvas/tools/focusKeeper';

export { readEnvelope } from './lib/book/envelope';
export { initPaperJs } from './lib/layeredCanvas/tools/draw/bubbleGraphic';

export class Renderer {
  constructor(private arrayLayer: ArrayLayer, private layeredCanvas: LayeredCanvas, private focusKeeper: FocusKeeper, private marks: boolean[]) {}
  cleanup() {
    this.layeredCanvas.cleanup();
  }
}

export function buildRenderer(canvas: HTMLCanvasElement, book: Book): Renderer {
  const viewport = new Viewport(canvas, () => {});
  const focusKeeper = new FocusKeeper();
  const layeredCanvas = new LayeredCanvas(viewport, true);

  const floorLayer = new FloorLayer(layeredCanvas.viewport, () => {}, focusKeeper);
  layeredCanvas.rootPaper.addLayer(floorLayer);

  let papers: Paper[] = [];
  // pages.push(pages[0]);
  let pageNumber = 0;
  for (const page of book.pages) {
    for (const bubble of page.bubbles) {
      bubble.pageNumber = pageNumber;
    }
    papers.push(buildPaper(page));
    pageNumber++;
  }
  const direction = getDirectionFromReadingDirection(book.direction);
  const {fold, gapX, gapY} = getFoldAndGapFromWrapMode(book.wrapMode);
  const marks: boolean[] = [];
  const arrayLayer = new ArrayLayer(
    papers, marks, fold, gapX, gapY, direction,
    () => {},
    () => {},
    () => {},
    () => {},
    () => {},
    () => {},
    () => {});
  layeredCanvas.rootPaper.addLayer(arrayLayer);

  return new Renderer(arrayLayer, layeredCanvas, focusKeeper, marks);
}

export function destroyRenderer(renderer: Renderer) {
  renderer.cleanup();
}

function buildPaper(page: Page) {
  const paper = new Paper(page.paperSize, false);

  // renderer
  const paperRendererLayer = new PaperRendererLayer();
  paperRendererLayer.setFrameTree(page.frameTree);
  paperRendererLayer.setBubbles(page.bubbles);
  paper.addLayer(paperRendererLayer);

  // frame
  page.frameTree.bgColor = page.paperColor;
  page.frameTree.borderColor = page.frameColor;
  page.frameTree.borderWidth = page.frameWidth;

  return paper;
}

function getFoldAndGapFromWrapMode(wrapMode: WrapMode): { fold: number, gapX: number, gapY: number } {
  switch (wrapMode) {
    case "none":
      return { fold: 0, gapX: 100, gapY: 0 };
    case "two-pages":
      return { fold: 2, gapX: 100, gapY: 200 };
    case "one-page":
      return { fold: 1, gapX: 0, gapY: 0 };
  }
}

function getDirectionFromReadingDirection(readingDirection: ReadingDirection): number {
  switch (readingDirection) {
    case "left-to-right":
      return 1;
    case "right-to-left":
      return -1;
  }
}

export function listFonts(book: Book): {family: string, weight: string}[] {
  const fonts = new Set<string>();
  for (let page of book.pages) {
    for (let bubble of page.bubbles) {
      fonts.add(JSON.stringify({family: bubble.fontFamily, weight: bubble.fontWeight}));
    }
  }
  return [...fonts].map(font => JSON.parse(font)) as {family: string, weight: string}[];
}

export const localFonts: { [key: string]: string } = {
  '源暎アンチック': 'GenEiAntiqueNv5-M',
  '源暎エムゴ': 'GenEiMGothic2-Black',
  '源暎ぽっぷる': 'GenEiPOPle-Bk',
  '源暎ラテゴ': 'GenEiLateMinN_v2',
  '源暎ラテミン': 'GenEiLateMinN_v2',
  "ふい字": 'HuiFont29',
  "まきばフォント": 'MakibaFont13',
};

export function isLocalFont(fontFamily: string): boolean {
  return localFonts[fontFamily] !== undefined;
}

export function isGoogleFont(fontFamily: string): boolean {
  return !isLocalFont(fontFamily);
}

// Googleフォントの読み込みチェック用のキャッシュ
const loadedGoogleFonts = new Set();

// GoogleフォントをAPIから読み込む関数
// サブセットやバリエーションの情報を含むインターフェース
interface FontVariation {
  weight: string;
  subset?: string;
}

export async function loadGoogleFont(family: string, weights = ['400']) {
  try {
    const key = `${family}-${weights.join('-')}`;
    if (loadedGoogleFonts.has(key)) return;
 
    const familyParam = family.replace(/\s+/g, '+');
    const weightsParam = weights.join(';');
    const url = `https://fonts.googleapis.com/css2?family=${familyParam}:wght@${weightsParam}&display=swap`;
 
    const response = await fetch(url, {
      headers: { 'User-Agent': navigator.userAgent }
    });
    
    const css = await response.text();
    const fontUrlMatches = Array.from(css.matchAll(/src: url\((.+?)\) format\('woff2'\)/g));
    
    if (!fontUrlMatches.length) {
      throw new Error('No font URLs found in CSS');
    }
 
    const loadPromises = fontUrlMatches.map(match => {
      const fontUrl = match[1];
      const cssBlock = css.substring(0, match.index).split('}').slice(-1)[0];
      const weightMatch = cssBlock.match(/font-weight: (\d+)/);
      const weight = weightMatch ? weightMatch[1] : '400';
 
      const font = new FontFace(family, `url(${fontUrl})`, {
        weight,
        style: 'normal'
      });
 
      return font.load().then(loadedFace => {
        document.fonts.add(loadedFace);
        return loadedFace;
      });
    });
 
    await Promise.all(loadPromises);
    await document.fonts.ready;
    loadedGoogleFonts.add(key);
 
  } catch (error) {
    console.error(`Failed to load font "${family}":`, error);
    throw error;
  }
}

export async function loadGoogleFontForCanvas(family: string, weights = ['400']) {
  try {
    // 既存のフォント読み込み処理
    await loadGoogleFont(family, weights);
    
    // document.fonts.readyで待機
    await document.fonts.ready;
    
    // 各ウェイトについてCanvas対応を確認
    const checks = weights.map(weight => checkCanvasFontAvailable(family, weight));
    await Promise.all(checks);
    
    console.log(`Font "${family}" is fully loaded and ready for Canvas use`);
  } catch (error) {
    console.error(`Failed to load font "${family}" for Canvas:`, error);
    throw error;
  }
}

export async function checkCanvasFontAvailable(family: string, weight = '400', maxRetries = 20, interval = 50) {
  const testString = 'あいうえおABCDE12345';
  const fontSize = '24px';
  
  function measureWidth() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    // テスト対象のフォントで描画
    ctx.font = `${weight} ${fontSize} "${family}"`;
    const targetWidth = ctx.measureText(testString).width;
    
    // フォールバックフォントで描画
    ctx.font = `${weight} ${fontSize} serif`;
    const fallbackWidth = ctx.measureText(testString).width;
    
    return targetWidth !== fallbackWidth;
  }

  for (let i = 0; i < maxRetries; i++) {
    if (measureWidth()) {
      console.log(`Font "${family}" ${weight} is ready for Canvas`);
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error(`Timeout waiting for font "${family}" ${weight} to be ready for Canvas`);
}
