/* eslint-disable @typescript-eslint/member-ordering */
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChildren,
  QueryList,
  ElementRef,
  ViewEncapsulation,
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { animations } from '../../../animations';
import { Subject } from 'rxjs';
import { DashboardDataService } from '../services/dashboard-data.service';
import { SliderHelpers } from '../helpers/sliderHelpers';
import { SliderFile } from '@root/src/app/interfaces/interfaces';
import * as _ from 'lodash';
import { takeUntil } from 'rxjs/operators';
import { BaseServicesService } from '@root/src/app/services/base-services.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSecurePipe } from '@root/src/app/pipes/domSecurePipe';
import { YouTubePlayer } from '@angular/youtube-player';
import { CdkDragMove, CdkDropList, CdkDrag, CdkDragPlaceholder, CdkDragDrop } from '@angular/cdk/drag-drop';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroXMark, heroClock, heroMusicalNote, heroHome, heroFingerPrint } from '@ng-icons/heroicons/outline';

import { PdfSlideComponent } from '@root/src/app/shared/ui/atoms/pdf-slide/pdf-slide.component';

interface PlaylistBlockState {
  id: number;
  items: SliderFile[];
  currentIndex: number;
  currentPdfPage: number;
  timerSubscription: any;
  isActiveSchedule: boolean;
  status: string;
  scheduleData: any[];
  playback: 'interval' | 'touchscreen';
}

@Component({
  selector: 'app-slider',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.css'],
  animations: [animations],
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    RouterLink,
    DomSecurePipe,
    YouTubePlayer,
    CdkDropList,
    CdkDrag,
    CdkDragPlaceholder,
    NgIcon,
    PdfSlideComponent
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  viewProviders: [
    provideIcons({ heroXMark, heroClock, heroMusicalNote, heroHome, heroFingerPrint })
  ]
})
export class PlaylistComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChildren('videoElem')
  private videoElems: QueryList<ElementRef>;
  
  @ViewChildren('youtubePlayer')
  private youtubePlayers: QueryList<YouTubePlayer>;

  @ViewChildren('youtubePlayer', { read: ElementRef })
  private youtubePlayerRefs: QueryList<ElementRef>;

  playlistBlocks: PlaylistBlockState[] = [];
  
  activePlaylist: any = null;
  activePlaylistsQueue: any[] = [];
  currentQueueIndex: number = 0;
  
  masterBlockIndex: number = 0; 

  hideElementsDueToInactivity = false;
  _takeUntil: Subject<void> = new Subject();
  itemPlaceholder: string = '';
  screenHeight = 0;
  screenWidth = 0;
  baseurl: string;
  officeliveapi = 'https://view.officeapps.live.com/op/embed.aspx?src=';
  srcurl: string;
  
  playlist_id: number | undefined; 
  sub: any;

  playerConfig = {
    rel: 0,
    modestbranding: 1,
    origin: window.location.origin,
    autoplay: 1
  };

  constructor(
    private readonly _dashboardDataService: DashboardDataService,
    private baseService: BaseServicesService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef 
  ) {
    this.baseurl = this.baseService.getDomain();
    this.srcurl = this.officeliveapi + this.baseurl + '/assets/images/userFiles/';
  }

  ngAfterViewInit(): void {}

  ngOnInit(): void {
    this.sub = this.route.params.subscribe(params => {
      this.playlist_id = params['id'];
    });

    SliderHelpers.openFullscreen(document.documentElement);
    this.subscribeToDashboardData();
    document.body.style.overflowY = 'hidden';
    SliderHelpers.showHideOnMouseMove(this);
    this.screenHeight = screen.height;
    this.screenWidth = screen.width;
  }

  ngOnDestroy(): void {
    document.body.style.overflowY = 'scroll';
    this.cleanupTimers();
    this._takeUntil.next();
    this._takeUntil.complete();
    SliderHelpers.closeFullscreen(document);
    if (this.sub) this.sub.unsubscribe();
  }

  private cleanupTimers() {
    this.playlistBlocks.forEach(block => {
      if (block.timerSubscription) clearTimeout(block.timerSubscription);
    });
  }

  private subscribeToDashboardData(): void {
    this._dashboardDataService
      .dashboardDataSubscriberWithNewData()
      .pipe(takeUntil(this._takeUntil))
      .subscribe((_dashboardData) => {
        if (_dashboardData && _dashboardData.playlists && Array.isArray(_dashboardData.playlists)) {
          this.initPlaylistData(_dashboardData.playlists);
        }
      });
  }

  private initPlaylistData(playlists: any[]): void {
    if (this.playlist_id) {
      const found = playlists.find(p => p.id == this.playlist_id);
      this.activePlaylistsQueue = found ? [found] : [];
    } else {
      this.activePlaylistsQueue = playlists.filter(p => p.status === 'active');
    }

    if (this.activePlaylistsQueue.length === 0) {
      this.cleanupTimers();
      this.playlistBlocks = [];
      this.activePlaylist = null;
      return;
    }

    if (!this.activePlaylist || !this.activePlaylistsQueue.find(p => p.id === this.activePlaylist.id)) {
      this.startRotation();
    } else {
      const currentData = this.activePlaylistsQueue.find(p => p.id === this.activePlaylist.id);
      if (currentData) {
        const currentIds = this.playlistBlocks.map(b => b.id).sort().join(',');
        const newIds = (currentData.playlistblocks || []).map((b: any) => b.id).sort().join(',');

        if (currentIds !== newIds) {
          this.loadPlaylist(currentData);
        } else {
          this.updateBlocks(currentData.playlistblocks || []);
        }
      }
    }
  }

  // --- Rotation Logic ---

  private startRotation() {
    this.cleanupTimers();
    this.currentQueueIndex = 0;
    this.loadCurrentQueueItem();
  }

  private loadCurrentQueueItem() {
    if (this.activePlaylistsQueue.length === 0) return;

    if (this.currentQueueIndex >= this.activePlaylistsQueue.length) {
      this.currentQueueIndex = 0;
    }

    const playlistToPlay = this.activePlaylistsQueue[this.currentQueueIndex];
    console.log(`Switching to Playlist: ${playlistToPlay.name} (Index ${this.currentQueueIndex} of ${this.activePlaylistsQueue.length})`);
    this.loadPlaylist(playlistToPlay);
  }

  private determineMasterBlock(playlist: any): number {
    const blocks = playlist.playlistblocks || [];
    if (blocks.length === 0) return 0;

    let longestDuration = -1;
    let longestIndex = 0;

    blocks.forEach((block: any, index: number) => {
      let blockTotal = 0;
      const files = block.files || [];
      
      const hasYouTube = files.some((f: any) => f.type === 'youtube');
      
      if (hasYouTube) {
        blockTotal = 99999999; 
      } else {
        files.forEach((file: any) => {
          let itemDuration = 5; 
          if (file.videoDuration) itemDuration = file.videoDuration / 1000;
          else if (file.arbiteryData?.timeInterval) itemDuration = file.arbiteryData.timeInterval;
          else itemDuration = !block.timeIntervalBetweenItems ? 5 : block.timeIntervalBetweenItems;
          blockTotal += itemDuration;
        });
      }

      if (blockTotal > longestDuration) {
        longestDuration = blockTotal;
        longestIndex = index;
      }
    });

    return longestIndex;
  }

  private loadPlaylist(playlist: any) {
    this.activePlaylist = playlist;
    this.masterBlockIndex = this.determineMasterBlock(playlist);
    
    this.cleanupTimers();

    const blocksData = playlist.playlistblocks || [];
    this.createBlocks(blocksData);

    setTimeout(() => {
      this.playlistBlocks.forEach((block, index) => {
        this.runBlockLoop(index);
      });
    }, 0);
  }

  private createBlocks(blockDataArray: any[]) {
    this.playlistBlocks = blockDataArray.map((blockData: any) => {
      const processedFiles = this.processFiles(blockData);
      return {
        id: blockData.id,
        items: processedFiles,
        currentIndex: 0,
        currentPdfPage: 1,
        timerSubscription: null,
        isActiveSchedule: blockData.status === 'active', 
        status: blockData.status, 
        scheduleData: blockData.playlistschedules || [],
        playback: blockData.playback || 'interval'
      } as PlaylistBlockState;
    });
  }

  private updateBlocks(incomingBlocks: any[]) {
    this.playlistBlocks.forEach(existingBlock => {
      const incomingBlock = incomingBlocks.find(b => b.id === existingBlock.id);
      if (incomingBlock) {
        existingBlock.status = incomingBlock.status;
        existingBlock.isActiveSchedule = (incomingBlock.status === 'active');
        existingBlock.scheduleData = incomingBlock.playlistschedules || [];
        existingBlock.playback = incomingBlock.playback || 'interval';
      }
    });
  }

  private processFiles(blockData: any): any[] {
    if (blockData.files && blockData.files.length > 0) {
      const activeFiles = blockData.files.filter((f: any) => f.fileStatus === 'active');
      const sorted = _.sortBy(activeFiles, [(f) => f.playlistfile?.sortPosition || f.id]);
      sorted.forEach((_f) => {
        const timeInterval = !blockData.timeIntervalBetweenItems ? 5 : blockData.timeIntervalBetweenItems;
        _f.arbiteryData = { timeInterval };
      });
      return SliderHelpers.addTypeOfFileAndOthersInFilesArray(sorted);
    }
    return [];
  }

  // --- Central Advance Handler ---

  private advanceBlock(block: PlaylistBlockState, blockIndex: number): void {
    if (block.timerSubscription) {
      clearTimeout(block.timerSubscription);
      block.timerSubscription = null;
    }

    const isLastItem = (block.currentIndex >= block.items.length - 1);
    this.incrementBlockIndex(block);
    block.currentPdfPage = 1;

    // setTimeout(..., 0) breaks the synchronous stack.
    setTimeout(() => {
      if (isLastItem && blockIndex === this.masterBlockIndex && this.activePlaylistsQueue.length > 1) {
        this.currentQueueIndex++;
        this.loadCurrentQueueItem();
      } else {
        this.runBlockLoop(blockIndex);
      }
    }, 0);
  }

  // --- Main Loop ---

  private runBlockLoop(blockIndex: number): void {
    const block = this.playlistBlocks[blockIndex];
    if (!block) return;

    try { this.cdr.detectChanges(); } catch (e) { console.warn('Change detection error', e); }

    const isNowActive = (block.status === 'active');
    block.isActiveSchedule = isNowActive;

    if (!isNowActive || block.items.length === 0) {
      block.timerSubscription = setTimeout(() => {
        this.runBlockLoop(blockIndex);
      }, 2000);
      return;
    }

    let currentItem = block.items[block.currentIndex];
    if (!currentItem) {
      block.currentIndex = 0;
      currentItem = block.items[0];
    }

    let duration = (currentItem.arbiteryData?.timeInterval || 5) * 1000;

    if (currentItem.type === 'video' || currentItem.type === 'audio') {
      const mediaDuration = this.handleNativeMediaForBlock(block, currentItem, blockIndex);
      if (mediaDuration === 'RETRY') return;
      duration = mediaDuration as number;
    }
    else if (currentItem.type === 'youtube') {
      const ytDuration = this.handleYoutubeForBlock(block, currentItem, blockIndex);
      if (ytDuration === 'RETRY') return;
      duration = ytDuration as number;
      if (duration < 1000) duration = 1000;
    } 
    else {
      this.pauseVideosInBlock(blockIndex);
    }

    if (block.playback === 'touchscreen') {
      return; 
    }

    // Interval Timer
    block.timerSubscription = setTimeout(() => {
      if (currentItem.type === 'pdf') {
        this.handlePdfPagination(block, currentItem, blockIndex);
      } else {
        this.advanceBlock(block, blockIndex);
      }
    }, duration);
  }

  // --- Handlers ---
  private handleYoutubeForBlock(block: PlaylistBlockState, item: SliderFile, blockIndex: number): number | 'RETRY' {
    item.youtubeId = item.youtubeId || this.getYouTubeId(item.iframeSrc || item.nameInDisk);
    const targetId = `youtube-${blockIndex}-${block.currentIndex}`;
    const playerIndex = this.youtubePlayerRefs?.toArray().findIndex(ref => ref.nativeElement.id === targetId);

    if (playerIndex !== undefined && playerIndex !== -1) {
      const playerInstance = this.youtubePlayers.toArray()[playerIndex];
      if (playerInstance) {
        if (!playerInstance.getPlayerState) { 
          this.scheduleRetry(block, blockIndex); 
          return 'RETRY'; 
        }

        const state = playerInstance.getPlayerState();
        const duration = playerInstance.getDuration();
        const currentTime = playerInstance.getCurrentTime();

        // 0 = YT.PlayerState.ENDED
        if (state === 0) {
          if (block.playback === 'touchscreen') {
            playerInstance.seekTo(0, true);
            playerInstance.playVideo();
            this.scheduleRetry(block, blockIndex);
            return 'RETRY';
          } else {
            // Defer advancing to break call stack
            setTimeout(() => this.advanceBlock(block, blockIndex), 0);
            return 'RETRY';
          }
        }

        // If not playing, trigger play
        if (state !== 1) { 
          playerInstance.playVideo(); 
          this.scheduleRetry(block, blockIndex); 
          return 'RETRY'; 
        }

        // Return remaining duration for the fallback timer
        if (duration > 0) {
          const remaining = (duration - currentTime) * 1000;
          if (remaining < 500) return 1000;
          return remaining;
        }
      }
    }
    this.scheduleRetry(block, blockIndex);
    return 'RETRY';
  }

  private scheduleRetry(block: PlaylistBlockState, blockIndex: number) {
    if (block.timerSubscription) clearTimeout(block.timerSubscription);
    block.timerSubscription = setTimeout(() => this.runBlockLoop(blockIndex), 1000);
  }

  private handleNativeMediaForBlock(block: PlaylistBlockState, item: SliderFile, blockIndex: number): number | 'RETRY' {
    const elementId = `video-${blockIndex}-${block.currentIndex}`;
    const mediaRef = this.videoElems.find((ref) => ref.nativeElement.id === elementId);
    
    if (!mediaRef) { 
      this.scheduleRetry(block, blockIndex); 
      return 'RETRY'; 
    }

    const mediaEl = mediaRef.nativeElement as HTMLMediaElement;

    if (mediaEl.paused) {
      mediaEl.muted = false;
      mediaEl.play().catch(e => console.error("Media Autoplay prevented", e));
    }

    if (mediaEl.duration && !isNaN(mediaEl.duration) && isFinite(mediaEl.duration)) {
      return mediaEl.duration * 1000;
    }

    this.scheduleRetry(block, blockIndex);
    return 'RETRY';
  }

  private handlePdfPagination(block: PlaylistBlockState, item: SliderFile, blockIndex: number): void {
    block.currentPdfPage++;
    if (block.currentPdfPage > (item.pdfTotalPages || 1)) {
      this.advanceBlock(block, blockIndex);
    } else {
      this.runBlockLoop(blockIndex);
    }
  }

  // --- YouTube Event Hook ---

  onYoutubeStateChange(event: any, block: PlaylistBlockState) {
    const blockIndex = this.playlistBlocks.indexOf(block);
    if (blockIndex === -1) return;

    // event.data === 0 is YT.PlayerState.ENDED
    if (event.data === 0) {
      if (block.playback === 'touchscreen') {
        event.target.seekTo(0, true);
        event.target.playVideo();
      } else {
        // Interval mode / auto-playback: advance immediately
        this.advanceBlock(block, blockIndex);
      }
    }
  }

  // --- Drag and Drop ---
  onDragMoved($event: CdkDragMove, block: PlaylistBlockState) {
    let index = null;
    if ($event.distance.x > 0) index = this.getPlaceholderIndex(block, 'right');
    else if ($event.distance.x < 0) index = this.getPlaceholderIndex(block, 'left');
    
    if (index != null && block.items[index]) {
      const currentItem = block.items[index];
      this.itemPlaceholder = './assets/images/userFiles/' + currentItem.nameInDisk;
    }
  }

  drop($event: CdkDragDrop<any>, block: PlaylistBlockState, blockIndex: number): void {
    const horizontalDistance = $event.distance.x;
    if (block.timerSubscription) clearTimeout(block.timerSubscription);
    this.pauseVideosInBlock(blockIndex);
    if (horizontalDistance > 0) this.previousItem(block);
    else if (horizontalDistance < 0) this.nextItem(block);
    this.runBlockLoop(blockIndex);
  }

  getPlaceholderIndex(block: PlaylistBlockState, direction: 'right' | 'left') {
    let index = block.currentIndex;
    const length = block.items.length;
    if (direction === 'left') { index++; if (index === length) index = 0; } 
    else { if (index === 0) index = length - 1; else index--; }
    return index;
  }

  nextItem(block: PlaylistBlockState): void { this.incrementBlockIndex(block); block.currentPdfPage = 1; }
  previousItem(block: PlaylistBlockState): void { this.decrementBlockIndex(block); block.currentPdfPage = 1; }
  private incrementBlockIndex(block: PlaylistBlockState): void { block.currentIndex++; if (block.currentIndex >= block.items.length) block.currentIndex = 0; }
  private decrementBlockIndex(block: PlaylistBlockState): void { if (block.currentIndex === 0) block.currentIndex = block.items.length - 1; else block.currentIndex--; }

  goToHome(block: PlaylistBlockState, blockIndex: number): void {
    if (block.timerSubscription) clearTimeout(block.timerSubscription);
    this.pauseVideosInBlock(blockIndex);
    block.currentIndex = 0;
    block.currentPdfPage = 1;
    this.runBlockLoop(blockIndex);
  }

  private pauseVideosInBlock(blockIndex: number) {
    if (this.videoElems) {
      this.videoElems.forEach(v => {
        if (v.nativeElement.id.startsWith(`video-${blockIndex}-`)) {
          v.nativeElement.pause();
          v.nativeElement.currentTime = 0;
        }
      });
    }
  }

  getYouTubeId(url: string) {
    if (!url) return '';
    const arr = url.replace(/(>|<)/gi, '').split(/(vi\/|v%3D|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    return undefined !== arr[2] ? arr[2].split(/[^0-9a-z_\-]/i)[0] : arr[0];
  }

  pageRendered(e: any): void {}
}