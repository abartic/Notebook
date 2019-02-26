import { IPackageController } from './../../package-controller';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { map } from 'rxjs/operators';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Package } from './../../package';
import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';

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



  public isCollapsed = false;
  @Input() package;
  @Input() packageCtrl: IPackageController;
  @ViewChild('rootdiv') rootdiv: ElementRef;

  public screensize: string;
  public dropdownSettings = {
    displayKey: "propName",
    search: false,
    placeholder: 'Filter'
  };
  public selectedValue;

  ngOnInit() {
    const style = window.getComputedStyle(this.rootdiv.nativeElement);
    this.screensize = style.getPropertyValue('--screensize');

  }

  onResize(event) {
    const style = window.getComputedStyle(this.rootdiv.nativeElement);
    this.screensize = style.getPropertyValue('--screensize');

  }

  checkSize() {
    return (this.screensize || '').trim() === 'sm';
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



  onSelectEntity(row) {
    this.packageCtrl.onSelectEntity(row);
  }
  onNew() {
    this.packageCtrl.onNew();
  }
}
