import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '@root/src/app/services/api.service';
import { Subscription } from 'rxjs';
import { ToastService } from '@core/services/toast.service';
import { LoadingScreenService } from '@root/src/app/services/loading-screen.service';
import { animations } from '@root/src/app/animations';
import { GenericService } from '@root/src/app/services/generic.service';
import { AuthenticationService } from '@root/src/app/services/authentication.service';
import { BaseServicesService } from '@root/src/app/services/base-services.service';
import { DashboardDataService } from '../dashboard/services/dashboard-data.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroFolderOpen, heroCalendar, heroTrash, heroCircleStack, heroExclamationTriangle, heroPlus } from '@ng-icons/heroicons/outline';
import { FileThumbnailPipe } from '@root/src/app/pipes/file-thumbnail.pipe';


@Component({
    selector: 'app-files-gallery',
    templateUrl: './files-gallery.component.html',
    styleUrls: ['./files-gallery.component.css'],
    animations: [animations],
    imports: [NgIcon, FileThumbnailPipe],
    changeDetection: ChangeDetectionStrategy.Eager,
    viewProviders: [provideIcons({ heroTrash, heroFolderOpen, heroCalendar, heroCircleStack, heroExclamationTriangle, heroPlus })]
})
export class FilesGalleryComponent implements OnInit, OnDestroy {
  playlistId: any;
  playlistBlocks: any[] = [];
  subscription: Subscription;
  selectedFileId = 0;

  isMaster: boolean; // to check whether user logged in as master or not

  showDeleteModal = false;

  private toast = inject(ToastService);

  constructor(
    private dashboardDataService: DashboardDataService,
    private baseService: BaseServicesService,
    private auth: AuthenticationService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly apiService: ApiService,
    )
  {
    this.isMaster = this.auth.isMaster();
  }

  ngOnInit(): void {
    // Use paramMap observable to handle ID changes without component recreation
    this.activatedRoute.paramMap.subscribe(params => {
      this.playlistId = params.get('id');
      this.dashboardData();
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  // renderFiles() {

  //   let dashboardDataArray: any;
  //   this.playlistId = this.activatedRoute.snapshot.paramMap.get('id');
  //   dashboardDataArray = this.apiService.getDashboardDataArray();

  //   // checks dashboard data is in the service
  //   if (dashboardDataArray) {
  //     this.getFilesFromObject(dashboardDataArray);
  //   } else {
  //     // if data not found we will fetch it from the server
  //     this.dashboardData();
  //   }
  // }

  // gets files from server
  dashboardData(): void {
    this.subscription = this.dashboardDataService
      .dashboardDataSubscriberWithNewData()
      .subscribe(
        (_data) => {
          this.getFilesFromObject(_data);
        },
        (_err) => {
          console.error('Error fetching dashboard data:', _err);
        }
      );
  }

  getFilesFromObject(_object: any): void {
    if (_object && _object.playlists) {
      const playlist = _object.playlists.find(
        (e: any) => String(e.id) === String(this.playlistId)
      );

      if (playlist && playlist.playlistblocks) {
        // Map the blocks and sort files by sortPosition
        this.playlistBlocks = playlist.playlistblocks.map((block: any) => {
          if (block.files && block.files.length > 0) {
            block.files.sort((a: any, b: any) => {
              const posA = a.playlistfile?.sortPosition ?? 0;
              const posB = b.playlistfile?.sortPosition ?? 0;
              return posA - posB;
            });
          }
          return block;
        });
      } else {
        this.playlistBlocks = [];
      }
    }
  }

  deleteFileFromArray(_fileId: number): void {
    this.playlistBlocks.forEach(block => {
      if (block.files) {
        block.files = block.files.filter((file: any) => file.id != _fileId);
      }
    });
  }

  // Update this method to show the modal
  changeSelectedFileId(_fileId: number): void {
    this.selectedFileId = _fileId;
    this.showDeleteModal = true; 
  }

  closeModal(): void {
    this.showDeleteModal = false;
    this.selectedFileId = 0;
  }
}
