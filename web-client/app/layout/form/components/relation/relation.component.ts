import { Component, OnInit, Input, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { IPackageController } from '../../ipackage-controller';
import { routerTransition } from '../../../../router.animations';


@Component({
  selector: 'form-editor-relation',
  templateUrl: './relation.component.html',
  styleUrls: ['./relation.component.css'],
  animations: [routerTransition()]
})
export class RelationComponent implements OnInit, AfterViewInit {


  @Input() package;
  @Input() packageCtrl: IPackageController;
  @Input() relation: string;


  @ViewChild('rootdiv') rootdiv: ElementRef;
  // @ViewChild('dtablerow') dtablerow: ElementRef;
  // @ViewChild('tablerow') tablerow: ElementRef;

  public screensize: string;

  ngOnInit() {
  }

  private rowheight = 0;
  ngAfterViewInit(): void {
    const style = window.getComputedStyle(this.rootdiv.nativeElement);
    this.screensize = style.getPropertyValue('--screensize');

    // if (this.dtablerow) {
    //   this.rowheight = this.dtablerow.nativeElement.offsetHeight;
    //   this.dtablerow.nativeElement.style.display = "none";
    // }

    // this.packageCtrl.calculateMaxFilterItem(this.rowheight);
  }

  onResize(event) {
    let style = window.getComputedStyle(this.rootdiv.nativeElement);
    this.screensize = style.getPropertyValue('--screensize');

    // this.rowheight = this.tablerow ? this.tablerow.nativeElement.offsetHeight : this.rowheight;
    // this.packageCtrl.calculateMaxFilterItem(this.rowheight);
  }

  isSmallSizeScreen() {
    return (this.screensize || '').trim() === 'sm';
  }





}
