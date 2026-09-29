import { Component, Inject, OnInit, ViewChild, ChangeDetectorRef, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { DropzoneComponent, DropzoneDirective, DropzoneConfigInterface, DropzoneModule } from 'ngx-dropzone-wrapper';
import { BaseServicesService } from '@root/src/app/services/base-services.service';
import { AuthenticationService } from '@root/src/app/services/authentication.service';
import { animations } from '@root/src/app/animations';
import { GenericService } from '@root/src/app/services/generic.service';
import { Subject, Subscription } from 'rxjs';
import Compressor from 'compressorjs';
import { ToastService } from '@core/services/toast.service';
import { DropzoneApiService } from './dropzone-api.service';
import { UserLimitsInfo } from '../shared/user-limits-table/user-limits-info.types';
import { UserLimitsInfoService } from '../shared/user-limits-table/user-limits-info.service';
import { takeUntil } from 'rxjs/operators';

import { DecimalPipe } from '@angular/common';
import { UserLimitsTableComponent } from '../shared/user-limits-table/user-limits-table.component';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroXMark, heroQuestionMarkCircle, heroCloudArrowUp, heroLink, heroCheckCircle, heroExclamationTriangle } from '@ng-icons/heroicons/outline';
import { ionAddCircleOutline } from '@ng-icons/ionicons';

import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';

//const pdfjs = await import('pdfjs-dist/build/pdf');
//const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');

declare const $: any;

@Component({
  selector: 'app-dropzone-file-upload-modal',
  templateUrl: './dropzone-file-upload-modal.component.html',
  styleUrls: ['./dropzone-file-upload-modal.component.css'],
  animations: [animations],
  imports: [
    UserLimitsTableComponent, DropzoneModule, FormsModule, DecimalPipe, NgIcon
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  viewProviders: [
    provideIcons({ heroXMark, heroQuestionMarkCircle, heroCloudArrowUp, heroLink, heroCheckCircle, heroExclamationTriangle, ionAddCircleOutline })
  ]
})
export class DropzoneFileUploadModalComponent implements OnInit, OnDestroy {
  @ViewChild(DropzoneComponent) drpzoneForUploadFiles?: DropzoneComponent;
  @ViewChild(DropzoneDirective) drpzoneDirectiveRef?: DropzoneDirective;

  linkForUpload: string;

  dropdownOpen = false;

  userLimitInfos: UserLimitsInfo;

  subscribeToDropzoneUploadSubject: Subscription;
  
  uploadPath: string;
  isUploadActive = false;
  isUploading = false;
  isFileSpaceAboveLimit = false;
  modalHtmlElement: any;
  isAdmin: boolean;
  addingMapLink = false;
  iframeValid = false;
  isFirstTimeIframeChecked = false;
  iframeSrc = '';
  iframeName = '';
  iframeType: string = 'googleMap'; // googleMap or youtube

  modalStatus: 'canceled' | 'started' | 'completed';

  filesSpaceInBytes = 0;

  itemsAdditionalInfo = {};
  baseUrl: string;
  getToken: string;

  public dropzoneConfig: DropzoneConfigInterface;
  private _takeUntil: Subject<void> = new Subject();

  private toast = inject(ToastService);

  constructor(
    public dialogRef: DialogRef<string>, // Replace Close EventEmitter logic
    @Inject(DIALOG_DATA) public dialogData: any, // Receive data from service
    private genericService: GenericService,
    private baseService: BaseServicesService,
    private auth: AuthenticationService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _dropzoneApiService: DropzoneApiService,
    private _userLimitInfosService: UserLimitsInfoService
  ) {
    this.baseUrl = this.baseService.getPath();
    this.getToken = this.auth.getToken();

    this.linkForUpload = this.dialogData?.link;
    this.userLimitInfos = this.dialogData?.userLimitInfos;
    this.dropzoneConfig = this.initDrpzoneConfigObject(this.linkForUpload);
  }

  ngOnInit(): void {
    this.isAdmin = this.auth.getUserDetails().isAdmin;
    this.genericService.changeFileUploadModalStatus('started');
    
    this._userLimitInfosService.getUserLimitInfos
      .pipe(takeUntil(this._takeUntil))
      .subscribe((info) => {
        this.userLimitInfos = info;
      });
  }

  closeModal(): void {
    this.dialogRef.close(); // This closes the CDK window
    this.genericService.changeFileUploadModalStatus(this.modalStatus || 'canceled');
  }

  ngOnDestroy(): void {
    if (this.drpzoneForUploadFiles?.directiveRef) {
      this.drpzoneForUploadFiles?.directiveRef?.dropzone()?.removeAllFiles(true);
    }
  
    this._takeUntil.next();
    this._takeUntil.complete();
    this.resetEverything();
  }

  uploadFiles(): void {
    console.log('start upload files');
    if (this.addingMapLink) {
      this.addGoogleMapIframInServer();
    } else {
      this.drpzoneForUploadFiles.directiveRef.dropzone().processQueue();
    }
  }

  onError(_event): void {
    // _event[0] is the file object, _event[1] is the error message string
    const errorMessage = _event?.[1];
  
    // GUARD: If there is no message or the message is "Upload canceled", ignore it.
    if (!errorMessage || errorMessage === 'Upload canceled.') {
      return;
    }
  
    if (errorMessage === "You can't upload files of this type.") {
      this.toast.add({
        key: 'top-center',
        severity: 'warn',
        summary: 'File not supported. Please select MP4, PDF, and Image Files',
      });
    }
    
    console.error('Dropzone Error:', errorMessage);
  }

  onFileAdd(file: File): void {
    if (file?.name != null || file?.name != undefined) {
      const fileNameAttr = file.name.split('.');
      const fileExt = fileNameAttr[fileNameAttr.length - 1];

      if (fileExt == 'pdf' || fileExt == 'PDF') {
        this.setPdfPagesNumber(file);
      } else if (fileExt == 'mp4' || fileExt == 'MP4' || fileExt == 'mp3' || fileExt == 'MP3') {
        this.setVideoLength(file);
      }
    }
  }
  processingMultiple(_event: any): void {
    this.isUploading = true;
  }

  completeMultiple(_files: any[]): void {
    // updating user limit infos
    this._userLimitInfosService.updateUserLimitInfos();
    if (_files[0] && _files[0].status != 'error') {
      this.modalStatus = 'completed';
      setTimeout(() => {
        this.closeModal();
      }, 3000);
    }
  }

  sendingMultiple([file, xhr, formData]): void {
    formData.append(
      'itemsAdditionalData',
      JSON.stringify(this.itemsAdditionalInfo)
    );
  }

  resetEverything(): void {
    this.isUploadActive = false;
    this.isUploading = false;
  }

  /**
   * Checks whether added Google Map iFrame is valid
   */
  checkIframeCode(_iframe: string): void {
    const div = document.createElement('div');

    this.isFirstTimeIframeChecked = true;
    div.innerHTML = _iframe.trim();

    // checking whether added string is an iframe
    if (div.firstChild && div.firstChild.nodeName == 'IFRAME') {
      const iFrame: HTMLIFrameElement = div.firstChild as HTMLIFrameElement;

      if (
        iFrame.src &&
        iFrame.src.length > 0
        // iFrame.src.startsWith('https://www.google.com/maps/embed?pb=')
      ) {
        if (
          iFrame.src.startsWith('https://www.google.com/maps/embed?pb=') ||
          iFrame.src.startsWith('https://track.getslocation.com') ||
          iFrame.src.startsWith('https://embed.waze.com/iframe') ||
          iFrame.src.startsWith('https://www.youtube.com/embed')
        ){
          this.iframeValid = true;
          this.iframeSrc = iFrame.src;
          if(iFrame.src.startsWith('https://www.youtube.com/embed')) this.iframeType = 'youtube';
        }
      } else {
        this.iframeValid = false;
      }

      // iFrame.
    } else {
      this.iframeValid = false;
    }
  }

  /**
   * saving google map iframe into server
   */
  addGoogleMapIframInServer(): void {
    this.isUploading = true;
    this._dropzoneApiService
      .saveGoogleMapIframe({
        name: this.iframeName,
        iframe: this.iframeSrc,
        type: this.iframeType,
      })
      .subscribe({
        next: () => {
          this.toast.add({
            key: 'top-center',
            severity: 'success',
            summary: 'Success',
          });
        },
        error: (error) => {
          console.error('Upload error:', error);
          this.toast.add({
            key: 'top-center',
            severity: 'error',
            summary: 'Error',
            detail: 'An Error occurred. Please check your internet connection and try again.'
          });
          this.isUploading = false; // Reset loader so user can try again
        },
        complete: () => {
          this.modalStatus = 'completed';
          setTimeout(() => {
            this.closeModal();
          }, 1500);
        }
      });
  }
  private initDrpzoneConfigObject(_link?): any {
    return {
      url: this.baseUrl + '/api/' + _link,
      autoProcessQueue: false,
      uploadMultiple: true,
      parallelUploads: 100,
      // resizeWidth: 1024,
      // resizeQuality: 0.8,
      resizeQuality: 1,
      // acceptedFiles: 'image/*',
      headers: {
        Authorization: 'Bearer ' + this.getToken,
      },
      accept: (_file: File, _done: any): void => {
        if (_file && _file.size && !this.isAdmin) {
          this.filesSpaceInBytes += _file.size;

          if (
            this.filesSpaceInBytes + this.userLimitInfos.storageSpaceUsed >
            this.userLimitInfos.storageSpaceLimit * (1024 * 1024)
          ) {
            this.isFileSpaceAboveLimit = true;
          }
          this._changeDetectorRef.detectChanges();
        }
        _done();
      },
      removedfile: (_file: any): void => {
        if (_file) {
          this.removeAdditionalInfoForPDFOrVideoRemoved(_file);
          if (_file.size && !this.isAdmin) {
            this.filesSpaceInBytes -= _file.size; // removing file space

            if (
              this.filesSpaceInBytes + this.userLimitInfos.storageSpaceUsed <=
              this.userLimitInfos.storageSpaceLimit * (1024 * 1024)
            ) {
              this.isFileSpaceAboveLimit = false;
            }

            if (this.filesSpaceInBytes < 0) {
              this.filesSpaceInBytes = 0;
            }
          }
        }

        _file.previewElement.remove(); // removing file from the dropzone
        this._changeDetectorRef.detectChanges();
      },
      /*transformFile: (_file: File, _done: any): void => {
        // compressing the image file
        const self = this;

        if (_file) {
          // if file is not an image
          if (_file.type.split('/')[0] != 'image') {
            _done(_file);
            return;
          } else {
            if (_file.type == 'image/gif') {
              // file is a gif
              _done(_file);
              return;
            } else {
              new Compressor(_file, {
                quality: 0.6,
                convertSize: 100000,
                width: 2048,
                success(result): void {
                  _done(result);
                },
                error(err): void {
                  self.toast.add({
                    key: 'top-center',
                    severity: 'error',
                    summary: 'Error',
                    detail: 'An Error occurred. Please check your internet connection and try again.'
                  });
                  self.toast.clear();
                  console.error(err.message);
                  return;
                },
              });
            }
          }
        }
      },*/
    };
  }

  private async setPdfPagesNumber(file: File): Promise<void> {
    try {
      // Dynamic import
      const pdfjsLib = await import('pdfjs-dist');

      // Point worker to official CDN matching the installed version
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
      }

      // Read the file as an ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const typedArray = new Uint8Array(arrayBuffer);

      // Load the PDF Document
      const loadingTask = pdfjsLib.getDocument({
        data: typedArray,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
      });

      const pdf = await loadingTask.promise;

      // Set the page count in additional info
      console.log(`[PDF Success] ${file.name} has ${pdf.numPages} pages.`);
      this.itemsAdditionalInfo[file.name] = pdf.numPages;

      this._changeDetectorRef.detectChanges();
    } catch (error) {
      console.error('[PDF Error] Failed to extract page count:', error);

      this.toast.add({
        key: 'top-center',
        severity: 'error',
        summary: 'Could not read PDF pages. Please verify the file is not corrupted or password protected.',
      });

      // Default fallback
      this.itemsAdditionalInfo[file.name] = 1;
    }
  }

  private setVideoLength(file: File): void {
    window.URL = window.URL || window.webkitURL;

    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = (): void => {
      window.URL.revokeObjectURL(video.src);

      this.itemsAdditionalInfo[file.name] = video.duration;
    };

    video.onerror = (e): void => {

      this.toast.add({
        key: 'top-center',
        severity: 'error',
        summary: 'Invalid Audio/Video File, please add another',
      });

      this.drpzoneForUploadFiles.directiveRef.dropzone().removeAllFiles(true);
      this.itemsAdditionalInfo = {};
    };

    video.src = URL.createObjectURL(file);
  }

  private removeAdditionalInfoForPDFOrVideoRemoved(_file: File): void {
    const fileNameAttr = _file.name.split('.');
    const fileExt = fileNameAttr[fileNameAttr.length - 1];
    if (
      fileExt == 'pdf' ||
      fileExt == 'PDF' ||
      fileExt == 'mp4' ||
      fileExt == 'MP4' ||
      fileExt == 'mp3' ||
      fileExt == 'MP3'
    ) {
      if (
        Object.prototype.hasOwnProperty.call(
          this.itemsAdditionalInfo,
          _file.name
        )
      ) {
        delete this.itemsAdditionalInfo[_file.name];
      }
    }
  }
}
