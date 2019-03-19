import { Component, OnInit, Input, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { IPackageController } from '../../ipackage-controller';
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


  @ViewChild('rootdiv') rootdiv: ElementRef;

  public screensize: string;

  ngOnInit() {
    const style = window.getComputedStyle(this.rootdiv.nativeElement);
    this.screensize = style.getPropertyValue('--screensize');
  }
  

  onResize(event) {
    let style = window.getComputedStyle(this.rootdiv.nativeElement);
    this.screensize = style.getPropertyValue('--screensize');

  }

  isSmallSizeScreen() {
    return (this.screensize || '').trim() === 'sm';
  }





}
