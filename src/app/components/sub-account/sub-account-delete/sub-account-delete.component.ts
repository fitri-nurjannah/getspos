import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { SubAccount } from '@root/src/app/interfaces/interfaces';
import { ToastService } from '@core/services/toast.service';
import { SubAccountService } from '../sub-account.service';

// New Imports
import { Dialog, DialogRef, DialogModule } from '@angular/cdk/dialog';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroTrash, heroExclamationTriangle } from '@ng-icons/heroicons/outline';
import { TitleCasePipe } from '@angular/common';

@Component({
    selector: 'app-sub-account-delete',
    templateUrl: './sub-account-delete.component.html',
    imports: [DialogModule, NgIconComponent, TitleCasePipe],
    changeDetection: ChangeDetectionStrategy.Eager,
    providers: [
        provideIcons({ heroTrash, heroExclamationTriangle })
    ]
})
export class SubAccountDeleteComponent implements OnInit, OnDestroy {
  @ViewChild('deleteDialogTemplate', { static: true }) deleteDialogTemplate: TemplateRef<any>;
  
  public subAccount: SubAccount; // Made public for template access
  private dialogRef: DialogRef;
  private _takeUntil: Subject<void> = new Subject();

  private toast = inject(ToastService);

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _subAccountService: SubAccountService,
    private _dialog: Dialog // CDK Dialog service
  ) {}

  ngOnInit(): void {
    const subAccountId = this._activatedRoute.snapshot.params['id'];

    this._subAccountService.getSubAccounts$
      .pipe(
        take(1), 
        takeUntil(this._takeUntil)
      )
      .subscribe((_subAccounts: SubAccount[]) => {
        if (_subAccounts.length) {
          this._subAccountService
            .setAndGetSubAccount(subAccountId)
            .pipe(take(1))
            .subscribe((_subAccount: SubAccount) => {
              this.subAccount = _subAccount;
              this.openModal();
            });
        }
      });
  }

  openModal() {
    // Timeout prevents the ARIA focus error
    setTimeout(() => {
      this.dialogRef = this._dialog.open(this.deleteDialogTemplate, {
        disableClose: true,
        restoreFocus: false,
      });

      // Handle closing via backdrop or browser back
      this.dialogRef.closed.subscribe(() => {
        this.navigateToParent();
      });
    });
  }

  ngOnDestroy(): void {
    this._takeUntil.next();
    this._takeUntil.complete();
    if (this.dialogRef) this.dialogRef.close();
  }

  deleteSubAccount(): void {
    this._subAccountService.deleteSubAccount().subscribe({
      next: () => {
        this.toast.add({
          key: 'top-center',
          severity: 'success',
          summary: 'Subaccount deleted successfully!'
        });
        this.dialogRef.close();
      },
      error: () => {
        this.toast.add({
          key: 'top-center',
          severity: 'error',
          summary: 'An error occurred while deleting the subaccount.'
        });
        this.dialogRef.close();
      }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  private navigateToParent() {
    this._router.navigate(['../../'], { relativeTo: this._activatedRoute });
  }
}