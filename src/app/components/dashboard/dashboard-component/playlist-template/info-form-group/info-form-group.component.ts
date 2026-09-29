import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatHint } from '@angular/material/form-field';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';

import { MatOption } from '@angular/material/core';
import { CdkStepperNext } from '@angular/cdk/stepper';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroPencil, heroUsers } from '@ng-icons/heroicons/outline';

@Component({
    selector: 'app-info-fg',
    templateUrl: './info-form-group.component.html',
    styleUrls: ['./info-form-group.component.css'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatInput,
        MatSelect,
        MatOption,
        MatHint,
        CdkStepperNext,
        NgIcon,
        MatFormFieldModule,
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    viewProviders: [
        provideIcons({ heroPencil, heroUsers })
    ]
})
export class InfoFormGroupComponent implements OnInit {
  @Input()
  comingSubAccountsArray;

  @Input()
  modalFor: 'create' | 'edit';

  @Input()
  sliderTypes: 'pptx' | 'mix';

  @Input()
  selectedPlaylist;

  @Input() infoFG: FormGroup;

  masterAccountId: number;

  showForm = false;
  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.init();
  }
  public init(): void {
    const masterSA = this.comingSubAccountsArray.find(
      (_sb) => _sb.name == 'master'
    );
    this.masterAccountId = masterSA ? masterSA.id : null;

    if (this.modalFor == 'edit') {
      this.editFormValues();
    }
    this.showForm = true;
  }

  private editFormValues(): void {
    this.infoFG.patchValue({
      name: this.selectedPlaylist.name,
      subAccountSelectedArray: this.selectedPlaylist?.subAccounts?.map(
        (e) => e.id
      )
    });
  }

  public resetForm(): void {
    this.infoFG?.reset();
  }
}
