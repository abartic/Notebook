import { IPackageController } from './../../package-controller';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { map } from 'rxjs/operators';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Package } from './../../package';
import { Component, OnInit, Input } from '@angular/core';
import { Jsonp, Response } from '@angular/http';
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

  @Input() package;
  @Input() packageCtrl: IPackageController;
  constructor() { }

  ngOnInit() {

  }

  onClear() {
   this.packageCtrl.onClear();
  }

  onApply() {
    this.packageCtrl.onApply();
  }

  onSelectPage(index) {
    this.packageCtrl.onSelectPage(index);
  }

  onNextPage() {

    this.packageCtrl.onNextPage();
  }

  onPreviousPage() {

    this.packageCtrl.onPreviousPage();
  }

  onExecuteFilter(count: boolean) {

    this.packageCtrl.onExecuteFilter(count);
  }

  onSelectEntity(row) {
    this.packageCtrl.onSelectEntity(row);
  }
  onNew(){
    this.packageCtrl.onNew();
  }
}
