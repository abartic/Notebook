
import { Component, OnInit, Input } from '@angular/core';
import { routerTransition } from "../../../../router.animations";
import { IPackageController } from '../../ipackage-controller';
import { CustomDatepickerI18n } from '../../ngbdDatepickerI18n';
import { NgbDatepickerI18n } from '@ng-bootstrap/ng-bootstrap';



@Component({
  selector: 'form-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css'],
  animations: [routerTransition()],
  providers: [{ provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n }] // define custom NgbDatepickerI18n provider
})
export class EditorComponent implements OnInit {

  @Input() package;
  @Input() packageCtrl: IPackageController;

  constructor() { }



  ngOnInit() {
    
      window.scrollTo(0, 0)
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









