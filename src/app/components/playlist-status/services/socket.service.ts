import { Injectable, ApplicationRef } from '@angular/core';
import { AuthenticationService } from '@root/src/app/services/authentication.service';
import { map, Observable, Subscription } from 'rxjs';
import { SocketConfigs } from '@root/src/app/services/socket-configs.service';
import { PlaylistStatusDataService } from './playlist-status-data.service';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  dashboardDataObservable;
  sockectDisconnectObservable;
  tokenExpiredObservable;

  dataSubscription: Subscription;
  sockectDisconnectObservableSubscription: Subscription;
  tokenExpiredObservableSubscription: Subscription;

  reconnectInterval;
  checkTokenInterval;

  constructor(
    private socket: SocketConfigs,
    private authService: AuthenticationService,
    private dashboardDataService: PlaylistStatusDataService,
    private applicationRef: ApplicationRef
  ) {
    this.dashboardDataObservable = this.socket.fromEvent<void, string>('dashboardData');
    this.sockectDisconnectObservable = this.socket.fromEvent<string, string>('disconnect');
    this.tokenExpiredObservable = this.socket.fromEvent<void, string>('tokenExpired');
  }

  // connects with server and sends the subaccountId to the server
  initConnectionToSocket(_initReconnect: boolean): void {
    console.log('this is socket service', this.authService.getUserDetails());
    const { id, subAccountId } = this.authService.getUserDetails();

    this.socket.connect(); // connecting to the socket, if user came back on dashboard after changing the URL    

    this.listeningToDataChange();
    this.initTokenVarification();

    if (_initReconnect) {
      this.reconnectSocketAfterInternetLose();
    }
  }

  destroyConnection(): void {
    this.socket.disconnect();
    if (this.tokenExpiredObservableSubscription) {
      this.tokenExpiredObservableSubscription.unsubscribe();
    }
    if (this.sockectDisconnectObservableSubscription) {
      this.sockectDisconnectObservableSubscription.unsubscribe();
    }
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
    }
    if (this.checkTokenInterval) {
      clearInterval(this.checkTokenInterval);
    }
  }

  // subscriber for changing the data dynamically
  // automatically called after any master account changes (playlists updates, files deletion)
  private listeningToDataChange(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    console.log('playlist status attached');
    this.dataSubscription = this.dashboardDataObservable.subscribe(
      () => {
        this.dashboardDataService.getNewData();
        console.log('data received');
      },
      (_error) => {
        alert('an error please refresh the page or contact to Administrator');
        console.error(_error);
      }
    );
  }

  private reconnectSocketAfterInternetLose(): void {
    if (this.sockectDisconnectObservableSubscription) {
      this.sockectDisconnectObservableSubscription.unsubscribe();
    }

    this.sockectDisconnectObservableSubscription = this.sockectDisconnectObservable.subscribe(
      (_reason: any) => {
        // if client not disconnected from socket
        if (_reason != 'io client disconnect') {
          this.initReconnectInterval();
        }
      }
    );
  }

  private initReconnectInterval(): void {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
    }

    this.reconnectInterval = setInterval(() => {
      // if socket is disconnected, we connect it again
      if (this.socket.ioSocket.disconnected) {
        this.initConnectionToSocket(false);
      } else {
        this.dashboardDataService.getNewData();
        clearInterval(this.reconnectInterval);
      }
    }, 5000);
  }

  private initTokenVarification(): void {
    if (this.tokenExpiredObservableSubscription) {
      this.tokenExpiredObservableSubscription.unsubscribe();
    }

    this.tokenExpiredObservableSubscription = this.tokenExpiredObservable.subscribe(
      () => {
        this.authService.logout();
        this.applicationRef.tick();
      }
    );

    if (this.checkTokenInterval) {
      clearInterval(this.checkTokenInterval);
    }

    this.checkTokenInterval = setInterval(() => {
      this.socket.emit('validate_token', this.authService.getToken());
    }, 10000);
  }
}
