



import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { map } from 'rxjs/operators';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Package } from './../../package';
import { Component, OnInit, Input, ViewChild } from '@angular/core';

import { routerTransition } from "../../../../router.animations";
import { IPackageController } from '../../package-controller';


@Component({
  selector: 'form-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css'],
  animations: [routerTransition()]
})
export class EditorComponent implements OnInit {

  @Input() package;
  @Input() packageCtrl: IPackageController;
  
  constructor() { }

  
  
  ngOnInit() {
  
  
  }

  onSave() {
    this.packageCtrl.onSave();
  }

  onDelete() {
    this.packageCtrl.onDelete();
  }

  onUndo() {
    this.packageCtrl.onUndo();
  }

  onNew() {
    this.packageCtrl.onNew();
  }

  onPrint() {
    this.packageCtrl.onPrint();
  }

  onShowCalenar() {
    this.packageCtrl.onShowCalendar();
  }
}









