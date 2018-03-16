import { Component, OnInit, Input } from '@angular/core';
import { IPackageController } from '../../package-controller';
import { routerTransition } from '../../../../router.animations';

@Component({
  selector: 'form-editor-relation',
  templateUrl: './relation.component.html',
  styleUrls: ['./relation.component.css'],
  animations: [routerTransition()]
})
export class RelationComponent implements OnInit {


  @Input() package;
  @Input() packageCtrl: IPackageController;
  @Input() relation: string;
  
  constructor() { }

  ngOnInit() {
  }

}
