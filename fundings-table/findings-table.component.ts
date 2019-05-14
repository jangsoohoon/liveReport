import { Component } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { TurbineFindings } from '../../models/turbine-findings';
import { UserService } from '../../services/user.service';
import { TurbineFindingsService } from '../../services/turbine-findings.service';
import RankingUtils from '../../utils/ranking-utils';
import { DataSource } from '../../models/datasource';

@Component({
  selector: 'app-findings-table',
  templateUrl: './findings-table.component.html',
  styleUrls: ['./findings-table.component.scss'],
})
export class FindingsTableComponent {
  public sortedTurbineFindings: Observable<TurbineFindings[]>;
  public readonly visibleColumns;
  private sortColumn = new BehaviorSubject<string>('risk');
  private sortAscending = new BehaviorSubject<boolean>(false);

  constructor(
    public userService: UserService,
    private turbineFindingService: TurbineFindingsService,
  ) {
    this.visibleColumns = userService.userDetails.config.visibleColumns;
    this.sortedTurbineFindings = this.getSortedTurbineFindings();
  }

  private getSortedTurbineFindings(): Observable<TurbineFindings[]> {
    return combineLatest(
      this.turbineFindingService.getTurbineFindings(),
      this.sortColumn,
      this.sortAscending
    ).pipe(
      map(([turbineFindings, column, ascending]) => {
        const sorted = turbineFindings.slice(0); // Shallow copy, the fastest way: https://jsperf.com/cloning-arrays/3
        if (column === 'risk' && ascending) {
          return sorted.reverse();
        } else if (column === 'risk') {
          return sorted;
        }

        if (Object.values(DataSource).includes(column)) {
          sorted.sort((tf1, tf2) => {
            const w1 = RankingUtils.calculateRiskScore(tf1.findings, this.userService.userDetails.config.weights, <DataSource>(column));
            const w2 = RankingUtils.calculateRiskScore(tf2.findings, this.userService.userDetails.config.weights, <DataSource>(column));
            return w1 - w2;
          });
        }
        if (column === 'farm') {
          sorted.sort((tf1, tf2) => {
            return tf1.turbine.siteName.localeCompare(tf2.turbine.siteName);
          });
        }
        if (column === 'turbine') {
          sorted.sort((tf1, tf2) => {
            return RankingUtils.compareTurbines(tf1.turbine, tf2.turbine);
          });
        }

        if (ascending) {
          return sorted;
        }
        return sorted.reverse();
      })
    );
  }

  public applySort(column: string) {
    if (this.sortColumn.value === column) {
      this.sortAscending.next(!this.sortAscending.value);
      return;
    }
    this.sortColumn.next(column);
    this.sortAscending.next(column === 'farm' || column === 'turbine');
  }

  public getColumnSortClasses(column: string): string {
    if (column === 'rank' && this.sortColumn.value === 'risk') {
      return this.sortAscending.value ? 'sorted descending' : 'sorted ascending';
    }
    if (this.sortColumn.value !== column) {
      return '';
    }
    return this.sortAscending.value ? 'sorted ascending' : 'sorted descending';
  }
}
