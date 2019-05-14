import { Component, Input, HostListener } from '@angular/core';
import { SuiModalService } from 'ng2-semantic-ui';

import { TurbineFindings } from '../../../models/turbine-findings';
import { DataSource } from '../../../models/datasource';
import { DetailsModal } from '../../../details-modal/details-modal-helper';
import { UserService } from '../../../services/user.service';

import RankingUtils from '../../../utils/ranking-utils';
import CardUtils from '../../../utils/card-utils';

@Component({
  /*
  This is not valid HTML (component with element selector):
  <table><app-findings-table-row><tr>...</tr></app-findings-table-row></table>

  This is valid HTML, but requires an attribute selector for the component,
  which violates the style guide (https://angular.io/guide/styleguide#style-05-03):
  <table><tr app-findings-table-row>...</tr></table>

  As Angular 4 cannot omit the component wrapper tag, and no directive can be written to generate a valid DOM,
  there's no solution for this issue. The only workaround is ignoring the lint warning for the selector.
  */
  // tslint:disable-next-line:component-selector
  selector: '[app-findings-table-row]',
  templateUrl: './findings-table-row.component.html',
  styleUrls: ['./findings-table-row.component.scss'],
})
export class FindingsTableRowComponent {
  public readonly _dataSource = DataSource;

  @Input() public turbineFindings: TurbineFindings;

  public readonly visibleColumns;

  public get percentage(): number {
    return Math.round(this.turbineFindings.overallRiskRatio * 100);
  }

  public get riskColour(): string {
    return CardUtils.riskRatioToStatus(this.turbineFindings.overallRiskRatio);
  }

  public get roundedRisk(): number {
    return Math.floor(this.turbineFindings.overallRisk);
  }

  constructor(
    private modalService: SuiModalService,
    public userService: UserService,
  ) {
    this.visibleColumns = userService.userDetails.config.visibleColumns;
  }

  private hasDataSource(dataSource: DataSource) {
    return this.turbineFindings.findings.some((finding, ix) => finding.dataSource === dataSource);
  }

  public getDataSourceColour(dataSource: DataSource): string {
    if (!this.hasDataSource(dataSource)) {
      return 'no-data';
    }
    return RankingUtils.calculateHighestStatus(this.turbineFindings.findings, dataSource);
  }

  @HostListener('click') public onClick() {
    const modal = new DetailsModal({
      turbine: this.turbineFindings.turbine
    });
    this.modalService.open(modal);
  }
}
