import { ChangeDetectorRef, Component, EventEmitter, inject, Input, OnInit, Output, ViewChild, ViewEncapsulation, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { TemplateChoiceComponent } from '../template-choice/template-choice.component';
import { InfoFormGroupComponent } from '../info-form-group/info-form-group.component';
import { DateTimeFormGroupComponent } from '../date-time-form-group/date-time-form-group.component';
import { FilesFormGroupComponent } from '../files-form-group/files-form-group.component';
import { BlockContentComponent } from '../block-content/block-content.component';

import { ionCheckmarkSharp, ionAddCircleOutline, ionCloseCircleSharp, ionCreateOutline } from '@ng-icons/ionicons';
import { matKeyboardDoubleArrowRight, matKeyboardArrowRight } from '@ng-icons/material-icons/baseline';

import { DashboardApiService } from '../../../services/dashboard-api.service';
import { DashboardDataService } from '../../../services/dashboard-data.service';
import { ToastService } from '@core/services/toast.service';
import moment from 'moment';
import { CommonModule } from '@angular/common';

import { CdkStepper, CdkStepperModule, STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { CustomValidators } from '@root/src/app/components/authentication/custom-validators';

import { CustomStepperComponent } from '@root/src/app/components/modules/custom-stepper/custom-stepper.component';

interface MainModalData {
  template: 'horizontal' | 'vertical';
  numberOfBlocks: number;
  modalFor: 'create' | 'edit';
  sliderTypes: 'pptx' | 'mix';
  playlists: any[];
  subAccountsArray: any[];
  playlistId?: number;
}

declare const $: any;

@Component({
    selector: 'app-main-modal',
    imports: [
        TemplateChoiceComponent,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        InfoFormGroupComponent,
        BlockContentComponent,
        DateTimeFormGroupComponent,
        FilesFormGroupComponent,
        forwardRef(() => CustomStepperComponent),
        CdkStepperModule,
        
    ],
    providers: [
        {
            provide: STEPPER_GLOBAL_OPTIONS,
            useValue: { showError: true },
        }
    ],
    viewProviders: [provideIcons({ ionAddCircleOutline, ionCloseCircleSharp, ionCheckmarkSharp, matKeyboardDoubleArrowRight, matKeyboardArrowRight, ionCreateOutline })],
    templateUrl: './main-modal.component.html',
    styleUrl: './main-modal.component.css',
    changeDetection: ChangeDetectionStrategy.Eager,
    encapsulation: ViewEncapsulation.None
})

export class MainModalComponent implements OnInit {
  @ViewChild(InfoFormGroupComponent)
  InfoFormGroupComponent: InfoFormGroupComponent;

  @ViewChild(DateTimeFormGroupComponent)
  DateTimeFormGroupComponent: DateTimeFormGroupComponent;

  @ViewChild(FilesFormGroupComponent)
  FilesFormGroupComponent: FilesFormGroupComponent;

  @ViewChild(BlockContentComponent)
  BlockContentComponent: BlockContentComponent;

  @ViewChild('stepper') stepper!: CdkStepper;

  selectedTemplate: 'horizontal' | 'vertical' = 'vertical';
  selectedBlock: 'first' | 'second' = 'first';

  @Input() playlists = [];
  @Input() subAccountsArray = [];
  @Input() selectedPlaylist;

  //playlists = [];
  //subAccountsArray = [];
  //selectedPlaylist;

  uploadForm: FormGroup;
  modalFor: 'create' | 'edit' = 'create';
  sliderTypes: 'pptx' | 'mix';
  selectedItems = [];
  playlistId: number;

  infoFormGroup;
  dateTimeFormGroup;
  filesFormGroup;

  isSubmittingForm = false;

  coverImageName: string;
  masterAccountId: number;
  isWholeTimeSelectedForSlider = false;
  active: number | undefined = 0;

  activeStep: number = 1;
  currentContent: number = 0;

  blockPlaylistRef = inject<DialogRef<string>>(DialogRef<string>);
  data = inject(DIALOG_DATA);

  @Output() selectedTemplateEmitter: EventEmitter<'horizontal' | 'vertical'> = new EventEmitter();
  numberOfBlocks: number = 1;

  private toast = inject(ToastService);

  constructor(
    private fb: FormBuilder,
    private readonly dashboardApiService: DashboardApiService,
    private readonly dashboardDataService: DashboardDataService,
    private readonly _cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.uploadForm = this.fb.group({
      infoFG: this.fb.group({}),
      contents: this.fb.array([]),
    });
    this.openModal(this.data);
  }

  openModal(data: MainModalData) {
    this.numberOfBlocks = data.numberOfBlocks;
    this.selectedTemplate = data.template || 'vertical';
    this.modalFor = data.modalFor;
    this.sliderTypes = data.sliderTypes;
    this.playlists = data.playlists;
    this.subAccountsArray = data.subAccountsArray;
    this.playlistId = data.playlistId? data.playlistId : null;

    this.initSliderForm(this.modalFor, this.sliderTypes, this.playlistId? this.playlistId : null);
  }

  closeModal(data): void {
    let element = document.querySelector('.tw-modal');
    element.classList.add('!animate-slidedownclose'); // add animation class
    this.blockPlaylistRef.close(data);
  }

  onTemplateSelected(template: 'horizontal' | 'vertical') {
    this.selectedTemplate = template;
    this.selectedTemplateEmitter.emit(this.selectedTemplate);
  }

  getCurrentContentNum(contentNum){
    this.currentContent = contentNum;
  }

  onNavigateToStep(stepIndex: number) {
    console.log('Navigating to step index:', stepIndex);
    this.stepper.selectedIndex = stepIndex;
  }

  private createFormGroup(): FormGroup {
    return new FormGroup({
      dateGroup: new FormGroup({
        startDate: new FormControl(null, Validators.required),
        endDate: new FormControl(null, Validators.required),
        timeIntervalBetweenItems: new FormControl(null, Validators.required),
        isWholeTimeSelected: new FormControl(false), // <--- The control exists here
        customTimeIntervalBetweenItems: new FormControl(null),
        isTouchscreenMode: new FormControl(false),
        playback: new FormControl('interval'),
      },
      {
        validators: [
          CustomValidators.scheduledTimeValidator,
        ] 
      }
      ),
      filesGroup: new FormGroup({
         coverImageName: new FormControl(''),
         selectedItems: new FormControl('', Validators.required),
      })
    });
  }

  initSliderForm(_modalFor: 'create' | 'edit', _sliderTypes: 'pptx' | 'mix', _playlistId?: number): void {
    this.uploadForm = this.fb.group({
      infoFG: this.fb.group({ // Initialize infoFG here
        name: [null, Validators.required],
        subAccountSelectedArray: [null, Validators.required],
      }),
      // Generate the array dynamically based on 'block' count
      contents: this.fb.array(
        Array.from({ length: this.numberOfBlocks }, () => this.createFormGroup())
      ),
    });

    this.modalFor = _modalFor;
    this.sliderTypes = _sliderTypes;
    // updating isWholeTimeSelectedForSlider

    // resets the selectedItems array for selection of files in create form
    this.selectedItems = [];
    this.coverImageName = null;

    const masterSA = this.subAccountsArray.find(
      (_sb) => _sb.name == 'master'
    );
    this.masterAccountId = masterSA ? masterSA.id : null;
    
    if (this.modalFor == 'edit') {
      this.selectedPlaylist = this.playlists.find(
        (_s) => _s.id == _playlistId
      );
      this.uploadForm.get('infoFG').patchValue({
        name: this.selectedPlaylist.name,
        subAccountSelectedArray: this.selectedPlaylist.playlistsubaccounts?.map(s => s.subAccountId) || []
      });
  
      // 2. Fill the contents array with data from playlistblocks
      const contentsArray = this.uploadForm.get('contents') as FormArray;
      
      this.selectedPlaylist.playlistblocks.forEach((block, index) => {
        const isTouchscreen = block.playback === 'touchscreen';
        
        if (contentsArray.at(index)) {
          contentsArray.at(index).patchValue({
            dateGroup: {
              startDate: new Date(block.startDate),
              endDate: new Date(block.endDate),
              timeIntervalBetweenItems: block.timeIntervalBetweenItems,
              // ... other date fields
              isTouchscreenMode: isTouchscreen,
              playback: block.playback || 'interval'
            },
            filesGroup: {
              coverImageName: block.coverImageName, // <--- THIS IS CRUCIAL
              selectedItems: block.files || []
            }
          });
        }
      });
    } else {
      this.isWholeTimeSelectedForSlider = false;
      this.uploadForm.reset();
      this.InfoFormGroupComponent?.resetForm();
      this.FilesFormGroupComponent?.resetForm();
    }

    this._cdr.detectChanges();
  }

  saveButtonClicked(_isValid: boolean): void {
    if (_isValid) {
      this.isSubmittingForm = true;

      if (this.modalFor === 'create') {
        this.createSlider();
      } else if (this.modalFor === 'edit') {
        this.editSlider();
      }
    }
  }

  private createSlider(): void {
    const objToBeSend = this.getValuesFromForm();
    this.dashboardApiService.createPlaylist(objToBeSend).subscribe(
      () => {
        this.toast.add({
          key: 'top-center',
          severity: 'success',
          summary: 'Slider created!',
          closable: false,
        });
        // refreshing the page
        setTimeout(() => {
          location.reload();
        }, 1000);

        this.isSubmittingForm = false;
        this.dashboardDataService.getNewData(); // gets new data and add it in the subscriber in the service
        this.closeModal(null);
      },
      () => {
        this.isSubmittingForm = false;

        this.toast.add({
          key: 'top-center',
          severity: 'error',
          summary: 'Error in creating slider! Please try again.',
          closable: false,
        });
      }
    );
  }

  private editSlider(): void {
    const editedSlider = this.getValuesFromForm();
    editedSlider.id = this.selectedPlaylist.id;
    this.dashboardApiService.editPlaylist(editedSlider).subscribe(
      () => {
        this.toast.add({
          key: 'top-center',
          severity: 'success',
          summary: 'Slider Updated!',
          closable: false,
        });

        this.dashboardDataService.getNewData(); // gets new data and add it in the subscriber in the service
        this.closeModal(null);

        this.isSubmittingForm = false;
      },
      () => {
        this.toast.add({
          key: 'top-center',
          sticky: true,
          severity: 'error',
          summary: 'An error! Refresh Page.',
          closable: false,
        });
        this.isSubmittingForm = false;
      }
    );
  }

  private getValuesFromForm(): any {
    const infoFG = this.uploadForm.get('infoFG') as FormGroup;
    const contentsArray = this.uploadForm.get('contents') as FormArray || null;
    
    const subAccountSelected = infoFG.get('subAccountSelectedArray').value;
    if(!subAccountSelected.includes(this.masterAccountId)) subAccountSelected.splice(0, 0, this.masterAccountId);

    // const playlistsubaccounts = subAccountSelected.map(num => ({ subAccountId: num }));

    let playlistblocks = [];

    if (contentsArray && contentsArray.controls.length) {
      contentsArray.controls.forEach(item => {
        const content = item.getRawValue();
        // getting time interval
        let timeIntervalBetweenItems = content.dateGroup.timeIntervalBetweenItems;

        // if custom selected we will get custom added
        if (timeIntervalBetweenItems == 'custom') {
          timeIntervalBetweenItems = content.dateGroup.customTimeIntervalBetweenItems;
        }
        const selectedItems = content.filesGroup.selectedItems.map((_item) => {
          return {
            id: _item.id,
            expiresAt: _item.expiresAt? _item.expiresAt : null,
          };
        });

        const contentData = {
          type: this.sliderTypes,
          timeIntervalBetweenItems,

          startDate: this.changeDateToString(content.dateGroup.startDate),
          endDate: this.changeDateToString(content.dateGroup.endDate),
          playback: content.dateGroup.playback,
          playlistschedules: this.changeScheduledTimesIntoDates(content.dateGroup.scheduledTimes),

          playlistfiles: selectedItems,
          coverImageName: content.filesGroup.coverImageName,
        };
        playlistblocks.push(contentData);
      });
    }

    const dataToBeSend = {
      name: infoFG.get('name').value,
      playlistsubaccounts: subAccountSelected,
      blocks: playlistblocks.length,
      template: this.selectedTemplate,
      playlistblocks
    };
    return dataToBeSend;
  }

  private changeDateToString(_data): string {
    return moment(_data).format('YYYY-MM-DD');
  }

  private changeScheduledTimesIntoDates(_scheculedTimes): any {
    if(!_scheculedTimes || _scheculedTimes.length == 0) return [];
    _scheculedTimes.forEach((_times) => {
      _times.startTime = moment(_times.startTime, 'HH:mm').toString();
      _times.endTime = moment(_times.endTime, 'HH:mm').toString();
    });

    return _scheculedTimes;
  }

  get contentsArray(): FormArray {
    return this.uploadForm.get('contents') as FormArray;
  }
}