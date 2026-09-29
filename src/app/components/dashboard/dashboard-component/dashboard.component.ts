/* eslint-disable @typescript-eslint/prefer-for-of */
import { Component, OnDestroy, OnInit, inject, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ToastService } from '@core/services/toast.service';
import { Subject } from 'rxjs';
import { AuthenticationService } from '../../../services/authentication.service';

import { DashboardDataService } from '../services/dashboard-data.service';
import { DashboardApiService } from '../services/dashboard-api.service';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Dialog } from '@angular/cdk/dialog';
import { NgClass, LowerCasePipe, DatePipe } from '@angular/common';
import { SocketDataDirective } from '../socket-data/socket-data.directive';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { UserLimitsTableComponent } from '../../shared/user-limits-table/user-limits-table.component';
import { MatDivider } from '@angular/material/divider';
import { MatMenuTrigger, MatMenu, MatMenuContent, MatMenuItem } from '@angular/material/menu';
import { DomSecurePipe } from '@root/src/app/pipes/domSecurePipe';

import { PlaylistTemplateComponent } from './playlist-template/playlist-template.component';
import { MainModalComponent } from './playlist-template/main-modal/main-modal.component';
import { templateObject } from '@root/src/app/interfaces/interfaces';

import { lucideHardDriveUpload } from '@ng-icons/lucide';
import { heroPlayCircleSolid } from '@ng-icons/heroicons/solid';
import { heroPencilSquare, heroTrash } from '@ng-icons/heroicons/outline';
import { ionFingerPrint, ionSettingsSharp, ionTimeOutline, ionCalendarSharp, ionImageOutline } from '@ng-icons/ionicons';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    imports: [
        SocketDataDirective,
        NgIcon,
        RouterLink,
        UserLimitsTableComponent,
        MatDivider,
        NgClass,
        MatMenuTrigger,
        MatMenu,
        MatMenuContent,
        MatMenuItem,
        RouterOutlet,
        DomSecurePipe,
        LowerCasePipe,
        DatePipe,
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    viewProviders: [provideIcons({ lucideHardDriveUpload, heroPlayCircleSolid, ionFingerPrint, ionSettingsSharp, ionTimeOutline, ionCalendarSharp, ionImageOutline, heroPencilSquare, heroTrash })]
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild(PlaylistTemplateComponent) playlistTemplate!: PlaylistTemplateComponent;
  @ViewChild(MainModalComponent) mainModal!: MainModalComponent;

  tabStatus = 'active';
  fetchedIndexData: any;
  playlists: any[];

  isMaster: boolean;
  userDetails: any;
  userLimitInfos: any;

  // Modal State Management
  showDeleteModal = false; // Added to control Tailwind modal
  selectedPlaylistId: number | null = null;

  private chooseTemplate = inject(Dialog);
  private blockPlaylist = inject(Dialog);
  
  templateSelected: 'vertical' | 'horizontal' | null = null;
  numberOfBlocks: 1 | 2 | null = null;

  private _takeUntil: Subject<void> = new Subject();

  private toast = inject(ToastService);

  constructor(
    private dashboardApiService: DashboardApiService,
    private dashboardDataService: DashboardDataService,
    private auth: AuthenticationService,
    private route: ActivatedRoute,
    private _router: Router
  ) {
    this.isMaster = this.auth.isMaster();
    this.userDetails = this.auth.getUserDetails();
  }

  ngOnInit(): void {
    if (sessionStorage.getItem('fromLogin') === 'true') {
      sessionStorage.removeItem('fromLogin');
      window.location.reload();
    }
    this.getDashboardData();
  }

  ngOnDestroy(): void {
    this._takeUntil.next();
    this._takeUntil.complete();
    // TO CHECK
    //if (this._router.routerState.snapshot.url == '/dashboard/active-slider') {
      //return;
    //}
    this.dashboardDataService.stopInterval();
  }

  // MODAL TRIGGER
  openDeleteModal(id: number): void {
    this.selectedPlaylistId = id;
    this.showDeleteModal = true;
  }

  // DELETE LOGIC
  deletePlaylist(): void {
    if (!this.selectedPlaylistId) return;

    this.dashboardApiService.deletePlaylist(this.selectedPlaylistId).subscribe({
      next: (data: any) => {
        if (data.message === 'playlistDeleted') {
          this.dashboardDataService.getNewData();
          this.toast.add({
            key: 'top-center',
            severity: 'success',
            summary: 'Playlist Deleted!',
            closable: false,
          });
        }
        this.showDeleteModal = false; // Close modal on success
      },
      error: (err) => {
        this.toast.add({
          key: 'top-center',
          severity: 'error',
          summary: 'An error occurred. Please refresh.',
          closable: false,
        });
        console.error('Delete error:', err);
        this.showDeleteModal = false; // Close modal on error
      }
    });
  }

  // REUSABLE DIALOG LOGIC
  openBlockModal(_modalFor: 'create' | 'edit', _sliderTypes: 'pptx' | 'mix', _playlist?: any, template?: 'vertical' | 'horizontal'): void {
    if (template) { this.templateSelected = template; }
    if (_modalFor === 'edit' && _playlist?.blocks) { this.numberOfBlocks = _playlist.blocks; }
    
    this.blockPlaylist.open<string>(MainModalComponent, {
      data: {
        numberOfBlocks: this.numberOfBlocks,
        playlists: this.playlists,
        subAccountsArray: this.fetchedIndexData.totalSubAccounts,
        modalFor: _modalFor,
        sliderTypes: _sliderTypes,
        playlistId: _playlist?.id,
        template: this.templateSelected,
      },
    });
  }

  openTemplateDialog(): void {
    const dialogRef = this.chooseTemplate.open<templateObject>(PlaylistTemplateComponent);
    dialogRef.closed.subscribe((result) => {
      if (result){
        this.numberOfBlocks = result.blocks;
        this.templateSelected = result.orientation;
        this.openBlockModal('create', 'mix');
      }
    });
  }

  getDashboardData(): void {
    this.dashboardDataService
      .dashboardDataSubscriberWithNewData()
      .pipe(takeUntil(this._takeUntil))
      .subscribe((_dashboardData) => {
        this.userLimitInfos = _dashboardData.userLimitInfos;
        this.fetchedIndexData = _dashboardData;
        this.playlists = _dashboardData.playlists;
        
        if (!this.auth.isMaster()) {
          this._router.navigateByUrl('/dashboard/play');
        }
      });
  }

  onContextMenuClose(): void {
    // context menu close handler
  }

  // using showDeleteModal = false in its subscription.
}