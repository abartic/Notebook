
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { map } from 'rxjs/operators';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Package } from './../../package';
import { Component, OnInit, Input } from '@angular/core';
import { Http, Jsonp, Response } from '@angular/http';
import { routerTransition } from "../../../../router.animations";
import { Router } from '@angular/router';
import { toInteger } from '@ng-bootstrap/ng-bootstrap/util/util';




@Component({
  selector: 'form-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css'],
  animations: [routerTransition()]
})
export class FilterComponent implements OnInit {

  @Input() package: Package;
  constructor(private router: Router, private http: Http) { }

  ngOnInit() {
    this.package = new Package;
  }

  onClear() {
    if (this.package.filter) {
      this.package.filter.clearFilter();
    }
    this.package.row_current_page = 0;
    this.onExecuteFilter(true);
  }

  onApply() {
    this.package.row_current_page = 0;
    this.onExecuteFilter(true);
  }

  onSelectPage(index) {
    this.package.row_current_page = index;
    this.onExecuteFilter(false);
  }

  onNextPage() {

    this.package.row_current_page++;
    this.onExecuteFilter(false);
  }

  onPreviousPage() {

    this.package.row_current_page--;
    this.onExecuteFilter(false);
  }

  onExecuteFilter(count: boolean) {

    let offset = this.package.row_current_page * this.package.row_page_max;
    let limit = this.package.row_page_max;
    let query = this.package.filter.toFilter(offset, limit);

    let count_query = undefined;
    if (count === true)
      count_query = this.package.filter.toCountFilter(offset, limit);


    this.http.post('/sheetdata/getscalar',
      {
        spreadsheetName: 'partners',
        sheetName: 'partners',
        entityName: 'Partner',
        select: count_query
      })
      .subscribe(resp => {
        const result = resp.json();
        if (result.error === undefined) {
          this.package.row_count = result.scalar;
          let pages = (this.package.row_count) / this.package.row_page_max;
          this.package.row_pages = new Array<number>(toInteger(pages));
        }
        else if (result.error.status === 401)
          this.router.navigate(['/login']);

      });


    this.http.post('/sheetdata/select',
      {
        spreadsheetName: 'partners',
        sheetName: 'partners',
        entityName: 'Partner',
        select: query
      })
      .subscribe(resp => {
        const result = resp.json();
        if (result.error === undefined) {
          this.package.rows = result.rows;
        }
        else if (result.error.status === 401)
          this.router.navigate(['/login']);

      });
  }
}
