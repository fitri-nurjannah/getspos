import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { UserDetails } from '@root/src/app/interfaces/interfaces';
import { AuthenticationService } from '@root/src/app/services/authentication.service';
import { UserLimitsInfoService } from './user-limits-info.service';
import { UserLimitsInfo } from './user-limits-info.types';
import { DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-user-limits-table',
    templateUrl: './user-limits-table.component.html',
    styleUrls: ['./user-limits-table.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [DecimalPipe]
})
export class UserLimitsTableComponent implements OnInit {
  @Input()
  oneLinedSpacedLimits: boolean;

  @Input()
  showSubAccountLimits: boolean;

  userLimitInfos: UserLimitsInfo;
  userDetails: UserDetails;
  constructor(
    private _userLimitInfosService: UserLimitsInfoService,
    private _auth: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.userDetails = this._auth.getUserDetails();

    if (!this.userDetails.isAdmin) {
      this.getLimits();
    }
  }

  private getLimits(): void {
    this._userLimitInfosService.getUserLimitInfos.subscribe((_userLimits) => {
      this.userLimitInfos = _userLimits;
    });
  }
}
