import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroTrash, heroInformationCircle } from '@ng-icons/heroicons/outline';

@Component({
    selector: 'app-confirm-delete-dialog',
    imports: [NgIcon],
    templateUrl: './confirm-delete-dialog.component.html',
    styleUrl: './confirm-delete-dialog.component.css',
    changeDetection: ChangeDetectionStrategy.Eager,
    viewProviders: [provideIcons({ heroTrash, heroInformationCircle })]
})
export class ConfirmDeleteDialogComponent {
  constructor(
    public dialogRef: DialogRef<boolean>,
    @Inject(DIALOG_DATA) public data: { count: number; containsFolder: boolean }
  ) {}
}
