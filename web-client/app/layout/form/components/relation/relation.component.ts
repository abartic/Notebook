import { style } from '@angular/animations';
import { Component, OnInit, Input, HostBinding, ElementRef, ViewChild } from '@angular/core';
import { IPackageController } from '../../package-controller';
import { routerTransition } from '../../../../router.animations';
import { DomSanitizer } from '@angular/platform-browser';

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

  public screensize : string;

  ngOnInit() {
    let style = window.getComputedStyle(this.rootdiv.nativeElement);
    this.screensize = style.getPropertyValue('--screensize');
    console.log(this.screensize);
  }

  onResize(event) {
    let style = window.getComputedStyle(this.rootdiv.nativeElement);
    this.screensize = style.getPropertyValue('--screensize');
    console.log(this.screensize);
  }

  checkSize()
  {
    return (this.screensize || '').trim() === 'sm';
  }
}
