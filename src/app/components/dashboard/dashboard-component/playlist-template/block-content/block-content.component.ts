import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { CdkStepperPrevious } from '@angular/cdk/stepper';
import { FormGroup, FormArray } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { DomSecurePipe } from '@root/src/app//pipes/domSecurePipe';

@Component({
    selector: 'app-block-content',
    imports: [CommonModule, NgIcon, CdkStepperPrevious, DomSecurePipe],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './block-content.component.html'
})
export class BlockContentComponent {
  public _mainForm: FormGroup; 
  @Input() currentTemplate: 'horizontal' | 'vertical' = 'vertical';
  @Input() imageBaseUrl: string = 'assets/images/userFiles/'; 
  @Input() numberOfBlocks: number = 1;
  @Input() isSubmittingForm: boolean = false;
  @Input() modalFor: 'create' | 'edit';
  
  @Output() currentContent = new EventEmitter<number>();
  @Output() navigateToStep = new EventEmitter<number>();
  @Output() saveButtonClickEmitter = new EventEmitter<boolean>();

  coverImages$: Observable<any[]>;

  @Input() set mainForm(form: FormGroup) {
    if (form) {
      this._mainForm = form;
      this.setupImageListener(form);
    }
  }

  private setupImageListener(form: FormGroup) {
    const contentsArray = form.get('contents') as FormArray;

    if (contentsArray) {
      this.coverImages$ = contentsArray.valueChanges.pipe(
        // Reads initial form state (important for Edit mode)
        startWith(contentsArray.getRawValue()),
        map((contents: any[]) => {
          // Extracts coverImageName from the nested form structure
          return contents.map(c => c.filesGroup?.coverImageName || null);
        })
      );
    } else {
      this.coverImages$ = of([]);
    }
  }

  // Navigation: Go to the specific block setup (Date/Files)
  goToNextStep(num: number, step: number): void {
    this.currentContent.emit(num);
    this.navigateToStep.emit(step);
  }

  // Final Action: Trigger the create/edit API call in the parent
  submitForm(): void {
    this.saveButtonClickEmitter.emit(true);
  }
}