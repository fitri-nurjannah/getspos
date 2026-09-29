import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { UserDetails } from '@root/src/app/interfaces/interfaces';
import { AuthenticationService } from '@root/src/app/services/authentication.service';
import { NgClass, TitleCasePipe } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroHome, heroFolderOpen, heroSquare3Stack3d, heroUsers, heroComputerDesktop } from '@ng-icons/heroicons/outline';
import { ionMenuOutline } from '@ng-icons/ionicons';

@Component({
    selector: 'app-menu-layout',
    templateUrl: './menu-layout.component.html',
    styleUrls: ['./menu-layout.component.css'],
    imports: [NgIcon, RouterLink, NgClass, TitleCasePipe],
    changeDetection: ChangeDetectionStrategy.Eager,
    viewProviders: [provideIcons({ heroHome, heroFolderOpen, heroSquare3Stack3d, heroUsers, heroComputerDesktop, ionMenuOutline })]
})
export class MenuLayoutComponent implements OnInit {
  userDetails: UserDetails;
  hovered = false;
  navLinks: { href: string; icon: string; label: string; active: boolean }[] = [];
  isAdmin: boolean;
  isMaster: boolean;
  isMobileMenuActive: boolean = false;
  settingLinks: { href: string; icon: string; label: string; active: boolean }[] = [];

  constructor(private _router: Router, private auth: AuthenticationService) {}

  ngOnInit() {
    this.isAdmin = this.auth.getUserDetails().isAdmin;
    this.isMaster = this.auth.isMaster();
    this.userDetails = this.auth.getUserDetails();
    this.updateNavLinks();
    
    // Listen to route changes
    this._router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateNavLinks();
      }
    });
  }

  updateNavLinks() {
    const currentUrl = this._router.url;

    this.navLinks = [];
    this.settingLinks = [];

    if(this.isMaster){
      this.navLinks.push(
        { href: '/dashboard', icon: 'heroHome', label: 'Dashboard', active: currentUrl.includes('/dashboard') },
        { href: '/file-storage', icon: 'heroFolderOpen', label: 'File Storage', active: currentUrl.includes('/file-storage') },
        { href: '/sub-accounts', icon: 'heroSquare3Stack3d', label: 'Manage Accounts', active: currentUrl.includes('/sub-accounts') }
      );

      if(this.isAdmin) {
        this.navLinks.push(
          { href: '/users', icon: 'heroUsers', label: 'User Accounts', active: currentUrl.includes('/users') }
        );
        this.settingLinks.push(
          { href: '/playlist/status', icon: 'heroComputerDesktop', label: 'Playlists Status', active: currentUrl.includes('/playlist/status') }
        );
      }
    }
    
  }

  showMobileMenu() {
    console.log('Mobile menu toggled');
    console.log('Current state:', this.isMobileMenuActive);
    this.isMobileMenuActive = !this.isMobileMenuActive;
  }
}
