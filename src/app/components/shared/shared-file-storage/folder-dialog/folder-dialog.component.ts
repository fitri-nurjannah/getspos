import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroXMark } from '@ng-icons/heroicons/outline';

@Component({
    selector: 'app-folder-dialog',
    imports: [NgIcon],
    viewProviders: [provideIcons({ heroXMark })],
    templateUrl: './folder-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './folder-dialog.component.css'
})
export class FolderDialogComponent {
  constructor(
    public dialogRef: DialogRef<string>,
    @Inject(DIALOG_DATA) public data: { name: string; isCreating: boolean }
  ) {}
}
