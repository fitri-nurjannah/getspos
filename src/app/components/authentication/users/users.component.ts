/* eslint-disable @typescript-eslint/member-ordering */
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { Subscription } from 'rxjs';

import { animations } from '@root/src/app/animations';
import { ApiService } from '@root/src/app/services/api.service';
import { User, Plan } from '@root/src/app/interfaces/interfaces';
import { BaseHelpers } from '@root/src/app/helpers/baseHelpers';
import { CreateEditUsersComponent } from './create-edit-users/create-edit-users.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgClass, DecimalPipe } from '@angular/common';
import {
  heroEllipsisVertical,
  heroPencilSquare,
  heroTrash,
  heroCheckCircle,
  heroXCircle,
  heroUsers,
  heroInformationCircle,
} from '@ng-icons/heroicons/outline';
import { lucideUserPlus } from '@ng-icons/lucide';

import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { Dialog, DialogRef, DialogModule } from '@angular/cdk/dialog';
import { ToastService } from '@core/services/toast.service';

// Native Atomic Design Imports:
import { PaginationComponent } from '@root/src/app/shared/ui/molecules/pagination/pagination.component';
import { StatusDotComponent } from '@root/src/app/shared/ui/atoms/status-dot/status-dot.component';
import { BadgeComponent } from '@root/src/app/shared/ui/atoms/badge/badge.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  animations: [animations],
  imports: [
    NgIcon,
    NgClass,
    DecimalPipe,
    CreateEditUsersComponent,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    DialogModule,
    PaginationComponent,
    StatusDotComponent,
    BadgeComponent,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  viewProviders: [
    provideIcons({
      lucideUserPlus,
      heroEllipsisVertical,
      heroPencilSquare,
      heroTrash,
      heroCheckCircle,
      heroXCircle,
      heroUsers,
      heroInformationCircle,
    }),
  ],
})
export class UsersComponent implements OnInit, OnDestroy {
  @ViewChild('createEditUserComponent')
  private createEditUsersComponent: CreateEditUsersComponent;
  @ViewChild('deleteModal') deleteModal: any;

  isAdminProvidedPriceForEnterpriseUser = false;
  focusedUserId = 0;

  originalUsersArray: User[] = [];
  usersArrayToShow: User[] = [];
  arrayOfPlans: Plan[] = [];
  groupOf = 'all';

  // Native Pagination State:
  first = 0;
  rows = 10;

  // Native Sorting State:
  sortField: string = '';
  sortOrder: 'asc' | 'desc' = 'asc';

  private subscription: Subscription = new Subscription();
  private dialogRef: DialogRef;
  private toast = inject(ToastService);

  constructor(private apiService: ApiService, private dialog: Dialog) {}

  ngOnInit(): void {
    this.getUserList();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  // Returns currently visible sliced page of users:
  get paginatedUsers(): User[] {
    return this.usersArrayToShow.slice(this.first, this.first + this.rows);
  }

  getUserList(): void {
    this.subscription.add(
      this.apiService.getAllUsersOrCreateUser('get').subscribe({
        next: (_data) => {
          if (_data) {
            if (_data.arrayOfPlans) {
              this.arrayOfPlans = _data.arrayOfPlans || _data.arrayofPlans;
              if (!this.arrayOfPlans.find((p) => p.name === 'enterprise')) {
                this.arrayOfPlans.push({ id: null, name: 'enterprise' });
              }
            }

            if (_data.arrayOfUsers) {
              _data.arrayOfUsers.forEach((_user) => {
                if (_user.subscribedPlans && _user.subscribedPlans.length) {
                  _user.subscribedPlan = _user.subscribedPlans[0];
                  _user.planName = _user.subscribedPlan.plan?.name;
                  _user.subscriptionEndDate = _user.subscribedPlan.endDate;
                }
              });
              this.originalUsersArray = _data.arrayOfUsers;
              this.changeUsersArray(this.groupOf);
            }
          }
        },
        error: (err) => console.error(err),
      })
    );
  }

  openDeleteModal(userId: number): void {
    this.focusedUserId = userId;
    this.dialogRef = this.dialog.open(this.deleteModal, {});
  }

  deleteUser(): void {
    const userToDelete = this.originalUsersArray.find(
      (_user) => _user.id == this.focusedUserId
    );

    if (!userToDelete) return;

    if (this.getUsersArrayLength('admin') === 1 && userToDelete.isAdmin) {
      this.toast.add({
        severity: 'warn',
        summary: 'You cannot delete all Admin users!',
      });
      this.closeDeleteModal();
      return;
    }

    this.subscription.add(
      this.apiService.editDeleteUser('delete', this.focusedUserId).subscribe({
        next: () => {
          this.toast.add({
            life: 2000,
            severity: 'success',
            summary: 'User deleted!',
          });
          this.closeDeleteModal();
          this.getUserList();
        },
        error: (err) => {
          if (
            err &&
            err.error &&
            err.error.message == 'minAdminUsersLimitReached'
          ) {
            this.toast.add({
              severity: 'warn',
              summary: 'You cannot delete all Admin users!',
              closable: false,
            });
            return;
          }
          this.toast.add({
            sticky: true,
            severity: 'error',
            summary: 'Error! Please try again.',
          });
          this.closeDeleteModal();
        },
      })
    );
  }

  changeUsersArray(_getArrayFor: string): void {
    this.groupOf = _getArrayFor;
    this.usersArrayToShow = this.getUsersArrayFor(_getArrayFor);
    this.first = 0; // Reset pagination to first page
    if (this.sortField) {
      this.applySorting();
    }
  }

  // Client-side Column Sort
  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = 'asc';
    }
    this.applySorting();
  }

  private applySorting(): void {
    const order = this.sortOrder === 'asc' ? 1 : -1;
    this.usersArrayToShow.sort((a: any, b: any) => {
      const valA = a[this.sortField] ?? '';
      const valB = b[this.sortField] ?? '';
      return valA > valB ? order : valA < valB ? -order : 0;
    });
  }

  getUsersArrayFor(
    _arrayFor:
      | 'all'
      | 'user'
      | 'admin'
      | 'active'
      | 'inactive'
      | 'freemium'
      | 'location'
      | 'enterprise'
      | string
  ): User[] {
    let usersArray: User[] = [];

    if (_arrayFor == 'all') {
      usersArray = this.originalUsersArray.filter((e) => true);
    } else if (_arrayFor == 'user') {
      usersArray = this.originalUsersArray.filter((e) => e.isAdmin == false);
    } else if (_arrayFor == 'admin') {
      usersArray = this.originalUsersArray.filter((e) => e.isAdmin == true);
    } else if (_arrayFor == 'active') {
      usersArray = this.originalUsersArray.filter((e) => e.isActive == true);
    } else if (_arrayFor == 'inactive') {
      usersArray = this.originalUsersArray.filter((e) => e.isActive == false);
    } else if (_arrayFor == 'freemium') {
      usersArray = this.originalUsersArray.filter((e) => {
        if (e.subscribedPlan && e.subscribedPlan.plan) {
          return (
            BaseHelpers.checkPlanName(e.subscribedPlan.plan.name).isFreemium &&
            e.isAdmin == false
          );
        }
        return false;
      });
    } else if (_arrayFor == 'location') {
      usersArray = this.originalUsersArray.filter((e) => {
        if (e.subscribedPlan && e.subscribedPlan.plan) {
          return (
            BaseHelpers.checkPlanName(e.subscribedPlan.plan.name).isLocation &&
            e.isAdmin == false
          );
        }
        return false;
      });
    } else if (_arrayFor == 'enterprise') {
      usersArray = this.originalUsersArray.filter((e) => {
        if (e.subscribedPlan && e.subscribedPlan.plan) {
          return (
            BaseHelpers.checkPlanName(e.subscribedPlan.plan.name)
              .isEnterprise && e.isAdmin == false
          );
        }
        return false;
      });
    } else {
      usersArray = this.originalUsersArray;
    }

    return usersArray;
  }

  closeDeleteModal(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  getUsersArrayLength(_getLengthFor: string): number {
    return this.getUsersArrayFor(_getLengthFor).length;
  }

  openCreateForm(): void {
    this.createEditUsersComponent.openModal('create');
  }

  openEditForm(_user: User): void {
    this.createEditUsersComponent.openModal('edit', _user);
  }
}