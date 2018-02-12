import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { map } from 'rxjs/operators';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Package } from './../../package';
import { Component, OnInit, Input } from '@angular/core';
import { Http, Jsonp, Response } from '@angular/http';
import { routerTransition } from "../../../../router.animations";
import { Router } from '@angular/router';




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

  onApply() {

    this.http.post('/sheetdata/select',
      {
        spreadsheetName: 'partners',
        sheetName: 'partners',
        entityName: 'Partner',
        select: 'select C, D, E, F where C = "OMG" limit 25'
      })
      .subscribe(resp => {
        const result = resp.json();
        if (result.error === undefined)
          this.package.rows = result;
        else if (result.error.status === 401)
          this.router.navigate(['/login']);

      });
  }
}
