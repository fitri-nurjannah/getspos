import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, input, effect, OnDestroy, afterNextRender, } from '@angular/core';

if (typeof (Promise as any).try !== 'function') {
  (Promise as any).try = function (fn: any, ...args: any[]) {
    return new Promise((resolve) => resolve(fn(...args)));
  };
}

@Component({
  selector: 'app-pdf-slide',
  imports: [],
  templateUrl: './pdf-slide.component.html',
  styleUrl: './pdf-slide.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PdfSlideComponent implements OnDestroy {
  @ViewChild('pdfCanvas') canvasRef?: ElementRef<HTMLCanvasElement>;

  src = input.required<string>();
  page = input<number>(1);

  private renderTask: any = null;
  private isViewReady = false;

  // Cache document in memory
  private cachedPdfDoc: any = null;
  private cachedUrl: string | null = null;

  constructor() {
    afterNextRender(() => {
      this.isViewReady = true;
      this.renderPdf();
    });

    effect(() => {
      this.src();
      this.page();

      if (this.isViewReady) {
        this.renderPdf();
      }
    });
  }

  private async renderPdf(): Promise<void> {
    const url = this.src();
    const rawPageNum = Number(this.page()) || 1;

    if (!url || !this.canvasRef?.nativeElement) {
      return;
    }

    try {
      // Cancel previous page render if timer ticked quickly
      if (this.renderTask) {
        this.renderTask.cancel();
      }

      const pdfjsLib = await import('pdfjs-dist');

      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      }

      if (this.cachedUrl !== url || !this.cachedPdfDoc) {
        this.cachedPdfDoc = await pdfjsLib.getDocument({
          url: url,
          verbosity: 0,
          cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
          cMapPacked: true
        }).promise;
        this.cachedUrl = url;
      }

      const pdf = this.cachedPdfDoc;

      const safePageNum = Math.min(Math.max(1, rawPageNum), pdf.numPages);

      const pdfPage = await pdf.getPage(safePageNum);

      const canvas = this.canvasRef.nativeElement;
      const context = canvas.getContext('2d');

      if (!context) return;

      const viewport = pdfPage.getViewport({ scale: 2 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      this.renderTask = pdfPage.render({
        canvasContext: context,
        viewport: viewport,
        canvas: canvas
      });

      await this.renderTask.promise;

    } catch (error: any) {
      if (error?.name !== 'RenderingCancelledException') {
        console.error('[PdfSlide ❌ Error]:', error);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.renderTask) {
      this.renderTask.cancel();
    }
    this.cachedPdfDoc = null;
    this.cachedUrl = null;
  }
}
