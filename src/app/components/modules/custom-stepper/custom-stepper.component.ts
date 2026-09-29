import { CdkStep, CdkStepper, CdkStepperModule } from '@angular/cdk/stepper';
import { Component, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

import { CommonModule, NgTemplateOutlet } from '@angular/common';

import { matKeyboardDoubleArrowRight, matKeyboardArrowRight } from '@ng-icons/material-icons/baseline';
import { ionRemove } from '@ng-icons/ionicons';
import { NgIcon, provideIcons } from '@ng-icons/core';


@Component({
    selector: 'app-custom-stepper',
    imports: [NgTemplateOutlet, CdkStepperModule, NgIcon, CommonModule],
    templateUrl: './custom-stepper.component.html',
    styleUrl: './custom-stepper.component.css',
    providers: [{ provide: CdkStepper, useExisting: CustomStepperComponent }],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Eager,
    viewProviders: [provideIcons({ matKeyboardDoubleArrowRight, matKeyboardArrowRight, ionRemove })]
})
export class CustomStepperComponent extends CdkStepper {
  
  onClick(index: number): void {
    this.selectedIndex = index;
  }

  // 2. Safe error message getter
  getStepError(step: CdkStep): string {
    const errors = (step.stepControl as any)?.errors;
    if (!errors) return 'Invalid'; // Fallback if errors is null but invalid is true

    if (errors['required']) return 'Field is required';
    if (errors['email']) return 'Invalid email';
    if (errors['minlength']) return `Min ${errors['minlength'].requiredLength} chars`;
    
    // 3. Fallback for any other error
    return 'Invalid Input';
  }
}
