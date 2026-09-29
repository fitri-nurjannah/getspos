import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AuthenticationService } from '../../../services/authentication.service';

import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ionPower } from '@ng-icons/ionicons';

@Component({
    selector: 'app-header-layout',
    templateUrl: './header-layout.component.html',
    styleUrls: ['./header-layout.component.css'],
    imports: [RouterLink, NgIcon],
    changeDetection: ChangeDetectionStrategy.Eager,
    viewProviders: [provideIcons({ ionPower })]
})
export class HeaderLayoutComponent implements OnInit {
  isLoggedIn: boolean;
  isAdmin: boolean;
  isMaster: boolean;

  constructor(private auth: AuthenticationService) {
    this.isLoggedIn = this.auth.isLoggedIn();
    this.isAdmin = this.auth.getUserDetails().isAdmin;
    this.isMaster = this.auth.isMaster();
  }

  ngOnInit(): void {
    this.isLoggedIn = this.auth.isLoggedIn();
  }

  logout(): void {
    this.removeTokenFromServer();
  }

  private removeTokenFromServer(): void {
    this.auth.logoutFromServer()
    .subscribe({
      next: () => this.auth.logout(),
      error: () => this.auth.logout()
    });
  }
  
  // dummy users + playlist
  users = [
    {
      name: 'User 1',
      playlist: 'Playlist 1',
      isOnline: true,
    },
    {
      name: 'User 2',
      playlist: 'Playlist 2',
      isOnline: false,
    },
    {
      name: 'User 3',
      playlist: 'Playlist 3',
      isOnline: true,
    },
    {
      name: 'User 4',
      playlist: 'Playlist 4',
      isOnline: false,
    }
  ];

  get anyUserOnline(): boolean {
    return this.users.some(user => user.isOnline);
  }

  isDropdownActive = false; 

  showDropdown() {
    this.isDropdownActive = true;
  }

  hideDropdown() {
    this.isDropdownActive = false;
  }
}
