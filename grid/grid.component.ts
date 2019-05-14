import { Component, OnInit } from '@angular/core';
import { TurbineFindings } from '../models/turbine-findings';
import { TurbineFindingsService } from '../services/turbine-findings.service';
import { Observable } from 'rxjs';
import { DataSource } from '../models/datasource';

import { saveAs } from 'file-saver';

import RankingUtils from '../utils/ranking-utils';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit {
  allTurbineFindings: Observable<TurbineFindings[]>;

  constructor(private turbineFindingService: TurbineFindingsService) { }

  ngOnInit() {
    this.allTurbineFindings = this.turbineFindingService.getTurbineFindings();
  }

  public exportCsv() {
    const dataLines = [];
    const headers = [
      'Rank',
      'Turbine',
      'Site',
      'Inspection Findings',
      'Vibration Findings',
      'Temperature Findings',
      'Lubrication Findings'
    ];
    let rank = 0;
    dataLines.push(headers);

    this.allTurbineFindings.subscribe((allTurbineFindings: TurbineFindings[]) => {
      for (const turbineFindings of allTurbineFindings) {
        rank += 1;

        const dataItems = [];

        // TODO these will come later
        const inspectionFindings = '';
        const temperatureFindings = '';
        const lubricationFindings = '';

        const vibrationFindings = RankingUtils.calculateHighestStatus(turbineFindings.findings, DataSource.Vibration);

        // Csv needs quotes around strings (there maybe a comma in a string)
        dataItems.push(
          rank,
          '"' + turbineFindings.turbine.name + '"',
          '"' + turbineFindings.turbine.siteName + '"',
          '"' + inspectionFindings + '"',
          '"' + vibrationFindings + '"',
          '"' + temperatureFindings + '"',
          '"' + lubricationFindings + '"');

        const line = dataItems.join(',');
        dataLines.push(line);
      }
    });

    const file = new Blob([dataLines.join('\n')], { type: 'text/csv;charset=utf-8' });
    saveAs(file, 'insight-live-report-grid.csv');
  }
}
