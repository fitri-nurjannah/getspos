import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { animations } from '@root/src/app//animations';

import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatOption,
} from '@angular/material/core';
import { MatFormField, MatLabel, MatSuffix, MatHint } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatDateRangeInput, MatStartDate, MatEndDate, MatDatepickerToggle, MatDateRangePicker } from '@angular/material/datepicker';
import { NgIcon, provideIcons } from '@ng-icons/core';

import { MatInput } from '@angular/material/input';
import { NgxMatTimepickerDirective, NgxMatTimepickerComponent } from 'ngx-mat-timepicker';

import { CdkStepperNext, CdkStepperPrevious } from '@angular/cdk/stepper';
import moment from 'moment';
import { matPlusOutline } from '@ng-icons/material-icons/outline';
import { ionInformationCircleSharp } from '@ng-icons/ionicons';
import { ionWarning } from '@ng-icons/ionicons';
import { heroArrowsRightLeft, heroCheckCircle, heroClock, heroTrash, heroFingerPrint } from '@ng-icons/heroicons/outline';
import { CustomValidators } from '@root/src/app//components/authentication/custom-validators';

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
    selector: 'app-date-time-fg',
    templateUrl: './date-time-form-group.component.html',
    styleUrls: ['./date-time-form-group.component.css'],
    animations: [animations],
    providers: [
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
        },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ],
    imports: [
        FormsModule, ReactiveFormsModule,
        MatFormField, MatLabel, MatDateRangeInput, MatStartDate, MatEndDate, MatDatepickerToggle, MatSuffix, MatDateRangePicker, MatHint, MatInput, MatSelect, MatOption,
        NgxMatTimepickerDirective, NgxMatTimepickerComponent,
        CdkStepperNext, CdkStepperPrevious,
        NgIcon,
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    viewProviders: [provideIcons({ ionInformationCircleSharp, matPlusOutline, heroClock, heroCheckCircle, heroTrash, heroArrowsRightLeft, ionWarning, heroFingerPrint })],
})
export class DateTimeFormGroupComponent implements OnInit {
  @Input() modalFor: 'create' | 'edit';
  @Input() selectedPlaylist;
  @Input() sliderTypes: 'pptx' | 'mix';
  @Input() contentFormGroup!: FormGroup;
  @Input() currentContent: number;

  isWholeTimeSelectedForSlider = false;

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.init();
  }

  public init(): void {
    // 1. Initialize Base Controls
    if (!this.contentFormGroup.get('startDate')) {
      this.contentFormGroup.addControl('startDate', new FormControl(null, Validators.required));
      this.contentFormGroup.addControl('endDate', new FormControl(null, Validators.required));
      this.contentFormGroup.addControl('timeIntervalBetweenItems', new FormControl(null, Validators.required));
      this.contentFormGroup.addControl('isWholeTimeSelected', new FormControl(false));
      this.contentFormGroup.addControl('isTouchscreenMode', new FormControl(false));
      this.contentFormGroup.addControl('playback', new FormControl('interval'));
    }

    const stFormGroups = [];
    let wholeDaySelectedInSourceData = false;

    if (this.modalFor == 'create') {
      stFormGroups.push(this.initSingleScheduledTimeForForm());
    } else {
      // Edit Mode
      const schedules = this.sourceSchedules;

      if (schedules && schedules.length > 0) {
        schedules.forEach((_st) => {
          const start = this.extractTime(_st.startTime);
          const end = this.extractTime(_st.endTime);

          stFormGroups.push(
            this.initSingleScheduledTimeForForm(start, end)
          );

          if (start == '00:00' && end == '23:59') {
            wholeDaySelectedInSourceData = true;
          }
        });
      } else {
        // Fallback for new blocks in edit mode
        stFormGroups.push(this.initSingleScheduledTimeForForm());
      }
    }

    // Set Checkbox state
    this.contentFormGroup.get('isWholeTimeSelected')?.setValue(wholeDaySelectedInSourceData);
    this.isWholeTimeSelectedForSlider = wholeDaySelectedInSourceData;

    // Reset and Fill FormArray
    if (this.contentFormGroup.get('scheduledTimes')) {
       this.contentFormGroup.removeControl('scheduledTimes');
    }

    this.contentFormGroup.addControl(
      'scheduledTimes', 
      this.fb.array(stFormGroups, [CustomValidators.scheduledTimeValidator])
    );

    // Patch Dates and Interval
    if (this.modalFor == 'edit') {
      this.editFormValues();
    }else{
      if (this.contentFormGroup.get('timeIntervalBetweenItems')?.value == null) {
        this.contentFormGroup.get('timeIntervalBetweenItems')?.setValue(5);
      }
      if (this.contentFormGroup.get('playback')?.value == null) {
        this.contentFormGroup.get('playback')?.setValue('interval');
      }
    }

    this.contentFormGroup.updateValueAndValidity();
  }

  // --- HELPER: Resolve Data Source (Specific Block based on Index) ---
  get dataContext(): any {
    // If we are in edit mode and have playlist blocks, grab the specific one
    if (this.selectedPlaylist && 
        Array.isArray(this.selectedPlaylist.playlistblocks) && 
        this.selectedPlaylist.playlistblocks[this.currentContent]) {
      return this.selectedPlaylist.playlistblocks[this.currentContent];
    }
    
    return {};
  }

  // --- HELPER: Extract HH:mm from ISO String ---
  private extractTime(timeString: string): string {
    if (!timeString) return '';

    // Check if it's an ISO string (contains 'T')
    if (timeString.includes('T')) {
      return moment(timeString).format('HH:mm');
    }

    return timeString.substring(0, 5);
  }

  // --- HELPER: Get Schedules safely ---
  get sourceSchedules(): any[] {
    const data = this.dataContext;
    // Check both property names (frontend model vs backend JSON)
    return data.playlistschedules || [];
  }

  wholeTimeSelectedChanged(): void {
    this.isWholeTimeSelectedForSlider = !this.isWholeTimeSelectedForSlider;
    
    const isWholeTimeSelected = this.contentFormGroup.get('isWholeTimeSelected')?.value;
    const scheduledTimesFA = this.contentFormGroup.get('scheduledTimes') as FormArray;
    scheduledTimesFA.clear();

    scheduledTimesFA.setValidators([CustomValidators.scheduledTimeValidator]);

    if (isWholeTimeSelected) {
      // Whole Day Ticked
      scheduledTimesFA.push(this.initSingleScheduledTimeForForm('00:00', '23:59'));
    } else {
      // Custom Times
      if (this.modalFor == 'create') {
        scheduledTimesFA.push(this.initSingleScheduledTimeForForm());
      } 
      else if (this.modalFor == 'edit') {
        const _scheduledTimes = this.sourceSchedules;

        // If we have existing schedules in data, map them
        if (_scheduledTimes.length > 0) {
          for (const _st of _scheduledTimes) {
              const start = this.extractTime(_st.startTime);
              const end = this.extractTime(_st.endTime);
  
              if (!(start == '00:00' && end == '23:59')) {
                scheduledTimesFA.push(this.initSingleScheduledTimeForForm(start, end));
              }
          }
        }
        
        // If empty or only whole day was previously saved but now unticked
        if (scheduledTimesFA.length === 0) {
          scheduledTimesFA.push(this.initSingleScheduledTimeForForm());
        }
      }
    }
  }

  addScheduledTimesIntoForm(_startTime?, _endTime?): void {
    const control = this.contentFormGroup.controls['scheduledTimes'] as FormArray;
    control.push(this.initSingleScheduledTimeForForm(_startTime, _endTime));
  }

  removeScheduledTimesFromForm(i): void {
    const control = this.contentFormGroup.controls['scheduledTimes'] as FormArray;
    control.removeAt(i);
  }

  private editFormValues(): void {
    const data = this.dataContext;
    
    // If data is empty (e.g. new slide added during edit), do nothing or set defaults
    if (!data.startDate) return;

    // Handle Playback logic
    const playbackValue = data.playback || 'interval';
    const isTouchscreen = playbackValue === 'touchscreen';

    let timeIntervalBetweenItems = data.timeIntervalBetweenItems;
    timeIntervalBetweenItems = timeIntervalBetweenItems == null ? 5 : timeIntervalBetweenItems;
    
    const isStandard = [5, 10, 15, 30, 60, 300, 600, 900, 1800, 3600].includes(timeIntervalBetweenItems);

    if (!isStandard) {
      this.addCustomTimeIntervalBetweenItemsFormControl(timeIntervalBetweenItems);
    }

    this.contentFormGroup.patchValue({
      startDate: data.startDate,
      endDate: data.endDate,
      timeIntervalBetweenItems: isStandard ? timeIntervalBetweenItems : 'custom',
      playback: playbackValue,
      isTouchscreenMode: isTouchscreen
    });
  }

  private initSingleScheduledTimeForForm(_startTime?, _endTime?): FormGroup {
    return this.fb.group({
      startTime: [_startTime, Validators.required],
      endTime: [_endTime, Validators.required],
    });
  }

  private addCustomTimeIntervalBetweenItemsFormControl(timeIntervalBetweenItems): void {
    if (!this.contentFormGroup.get('customTimeIntervalBetweenItems')) {
      this.contentFormGroup.addControl(
        'customTimeIntervalBetweenItems',
        this.fb.control(
          timeIntervalBetweenItems,
          Validators.compose([
            Validators.required,
            Validators.min(2),
            Validators.max(1000000),
          ])
        )
      );
    }
  }

  timeIntervalChanged(_val: number | 'custom'): void {
    if (_val == 'custom') {
      this.addCustomTimeIntervalBetweenItemsFormControl(null);
    } else {
      this.contentFormGroup.removeControl('customTimeIntervalBetweenItems');
    }
  }

  playbackToggleChanged(): void {
    const isTouchscreen = this.contentFormGroup.get('isTouchscreenMode')?.value;
    const newValue = isTouchscreen ? 'touchscreen' : 'interval';
    
    this.contentFormGroup.get('playback')?.setValue(newValue);
  }

  get isWholeTimeSelected(): boolean {
    return this.contentFormGroup.get('isWholeTimeSelected')?.value;
  }
}