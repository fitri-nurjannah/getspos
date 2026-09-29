import { Directive, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from '../services/socket.service';

@Directive({
    selector: '[appSocketData]',
    standalone: true,
})
export class SocketDataDirective implements OnInit, OnDestroy {
  constructor(private socketService: SocketService) {}

  ngOnInit(): void {
    this.socketService.initConnectionToSocket(true);
  }

  ngOnDestroy(): void {
    this.socketService.destroyConnection();
  }
}
