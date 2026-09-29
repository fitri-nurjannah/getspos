import moment from 'moment';
import { fromEvent, interval, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PlaylistComponent } from '../slider/playlist.component';

export class SliderHelpers {
  constructor() {}

  // adds typeOfFile attribute on every file in the given files array
  public static addTypeOfFileAndOthersInFilesArray(_files): any[] {
    let typeOfFile;

    _files.forEach((f) => {
      typeOfFile = f.type.split('/')[0];

      // if the file is pdf
      if (
        typeOfFile === 'application' &&
        f.type.split('/')[1].toUpperCase() == 'PDF'
      ) {
        typeOfFile = f.type.split('/')[1];

        // adding the current timestamp in pdf object for sliding them
        f.timeStamp = new Date().getTime(); // generates the current time stamp
      }

      // f.fileName = f.nameInDisk;
      f.type = typeOfFile;
    });

    return _files;
  }

  // show hides the mouse on slider active
  public static showHideElementsOnMouseMove(
    _comingThis: PlaylistComponent
  ): void {

    interval(1500)
      .pipe(takeUntil(_comingThis._takeUntil))
      .subscribe(() => {
        _comingThis.hideElementsDueToInactivity = true;
        document.body.style.cursor = 'none';
      });

    let subscription: Subscription = new Subscription();

    fromEvent(document.body, 'mousemove')
      .pipe(takeUntil(_comingThis._takeUntil))
      .subscribe(() => {
        document.body.style.cursor = 'default';
        _comingThis.hideElementsDueToInactivity = false;

        subscription.unsubscribe();

        subscription = interval(3000)
          .pipe(takeUntil(_comingThis._takeUntil))
          .subscribe(() => {
            _comingThis.hideElementsDueToInactivity = true;
            document.body.style.cursor = 'none';
          });
      });
  }

  // show hides the mouse on slider active
  public static showHideOnMouseMove(
    _comingThis: PlaylistComponent
  ): void {

    interval(3000)
      .pipe(takeUntil(_comingThis._takeUntil))
      .subscribe(() => {
        _comingThis.hideElementsDueToInactivity = true;
        document.body.style.cursor = 'none';
      });

    let subscription: Subscription = new Subscription();

    fromEvent(document.body, 'mousemove')
      .pipe(takeUntil(_comingThis._takeUntil))
      .subscribe(() => {
        document.body.style.cursor = 'default';
        _comingThis.hideElementsDueToInactivity = false;

        subscription.unsubscribe();

        subscription = interval(3000)
          .pipe(takeUntil(_comingThis._takeUntil))
          .subscribe(() => {
            _comingThis.hideElementsDueToInactivity = true;
            document.body.style.cursor = 'none';
          });
      });
  }

  private static checkFullscreen(_elim): boolean {
    return !!_elim.fullscreenElement;
  }

  // open fullscreen
  public static openFullscreen(_elim): void {
    // if the element is not in fullscreen mode
    if (!this.checkFullscreen(_elim)) {
      console.log('try openFullscreen()');
      try {
        if (_elim.requestFullscreen) {
          _elim.requestFullscreen();
        } else if (_elim.mozRequestFullScreen) {
          /* Firefox */
          _elim.mozRequestFullScreen();
        } else if (_elim.webkitRequestFullscreen) {
          /* Chrome, Safari and Opera */
          _elim.webkitRequestFullscreen();
        } else if (_elim.msRequestFullscreen) {
          /* IE/Edge */
          _elim.msRequestFullscreen();
        }
      } catch (error) {
        console.log('catched error in openFullScreen(): ', error);
      }
    }
  }

  /* Close fullscreen */
  public static closeFullscreen(_document): void {
    // if the element is in fullscreen mode
    if (this.checkFullscreen(_document)) {
      console.log('try closeFullscreen()');
      try {
        if (_document.exitFullscreen) {
          _document.exitFullscreen();
        } else if (_document.mozCancelFullScreen) {
          /* Firefox */
          _document.mozCancelFullScreen();
        } else if (_document.webkitExitFullscreen) {
          /* Chrome, Safari and Opera */
          _document.webkitExitFullscreen();
        } else if (_document.msExitFullscreen) {
          /* IE/Edge */
          _document.msExitFullscreen();
        }
      } catch (error) {}
    }
  }
}
