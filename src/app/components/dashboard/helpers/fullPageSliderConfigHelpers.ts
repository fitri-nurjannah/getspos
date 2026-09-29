import { SliderComponent } from '../slider/slider.component';

export class FullPageSliderConfigHelpers {
  public static getSliderConfigs(_comingThis: SliderComponent): any {
    return {
      anchors: ['fullpage_page_1'],
      autoScrolling: true,
      scrollHorizontally: true,

      afterLoad: async (origin, _destination, direction): Promise<void> => {
        console.log('afterLoad');

        // we only run code for first section, for other section, we control them from onLeave() callback
        // direction will be null for first time. If slider is coming back to first section,
        // direction will be "up"
        if (_destination.isFirst && !direction) {
          const destinationHtmlItem = _destination.item as HTMLDivElement;
          const pdfContainer = destinationHtmlItem.querySelector(
            '.pdfViewerContainer'
          ) as HTMLDivElement;
          const videoElement = destinationHtmlItem.querySelector(
            '.videoElement'
          ) as HTMLVideoElement;

          // if pdfContainer is in the section, we have a pdf section
          if (pdfContainer) {
            clearInterval(_comingThis.fullpageSectionMoveDownInterval);

            let pdfObject;

            const pdfNameWithTimeStamp =
              pdfContainer.dataset.pdfFileNameWithTimestamp;

            // runs interval untile pdfViewer loads the pdf file
            const timeInterval = setInterval(async () => {
              pdfObject =
                _comingThis.objectOfPdfsToSlidePages[pdfNameWithTimeStamp];

              // if pdfObject is not null, it means the pdf is loaded now
              if (pdfObject) {
                clearInterval(timeInterval);
                await _comingThis.slidePdfPages(pdfContainer);
              }
            }, 100);
          } else if (videoElement) {
            // if video is in the section
            this.ifVideoContent(videoElement, _comingThis, false);
          }
        }
      },
      onLeave: async (origin, _destination, direction): Promise<void> => {
        console.log('onLeave');
        const destinationHtmlItem = _destination.item as HTMLDivElement;
        const pdfContainer = destinationHtmlItem.querySelector(
          '.pdfViewerContainer'
        ) as HTMLDivElement;
        const videoElement = destinationHtmlItem.querySelector(
          '.videoElement'
        ) as HTMLVideoElement;
        clearTimeout(_comingThis.goToFirstPageFullPageTimer);
        // if pdfContainer is in the section, we have a pdf section
        if (pdfContainer) {
          await _comingThis.slidePdfPages(pdfContainer);

          // we check pdf is still here and not deleted by the dynamic data
          if (
            _comingThis.objectOfPdfsToSlidePages[
              pdfContainer.dataset.pdfFileNameWithTimestamp
            ]
          ) {
            if (_destination.isLast) {
              // calls first slider again

              this.goToFirstPageTimer(_comingThis);
            }
          }
        } else if (videoElement) {
          this.ifVideoContent(videoElement, _comingThis, _destination.isLast);
        } else if (_destination.isLast) {
          // calls first slider again
          this.goToFirstPageTimer(_comingThis);
        }
      },
    };
  }

  private static ifVideoContent(
    _videoElement: HTMLVideoElement,
    _comingThis: SliderComponent,
    _callGoToFirstPageTimeout: boolean
  ): void {
    const videoElement = _videoElement;

    videoElement.currentTime = 0;

    // IMPORTANT: settimeout is important to deal with code flow
    // stopping going down of the sections
    // setTimeout(() => {
    clearInterval(_comingThis.fullpageSectionMoveDownInterval);
    // }, 1000);

    // called when video ended
    videoElement.onended = (): void => {
      // attaching interval
      _comingThis.runSliderInterval();

      // sends to next page abruptly
      if (_comingThis.arrayOfFiles.length > 0 && _comingThis.fullpageApi) {
        _comingThis.fullpageApi.moveSectionDown();
      }

      // if last section, go to first page timout
      if (_callGoToFirstPageTimeout) {
        // sends to first page abruptly
        if (_comingThis.fullpageApi) {
          _comingThis.fullpageApi.moveTo('fullpage_page_1');
        }
      }
    };
  }

  private static goToFirstPageTimer(_comingThis): void {
    _comingThis.goToFirstPageFullPageTimer = setTimeout(() => {
      _comingThis.fullpageApi.moveTo('fullpage_page_1');
    }, parseInt(_comingThis.getToken(), 10) * 1000);
  }
}
