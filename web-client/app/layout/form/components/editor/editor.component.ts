import { Component, OnInit, Input} from '@angular/core';
import { routerTransition } from "../../../../router.animations";
import { IPackageController } from '../../ipackage-controller';


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









