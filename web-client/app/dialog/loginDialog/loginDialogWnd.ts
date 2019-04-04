
import { Component, Input, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'login-dialog-wnd',
  templateUrl: './loginDialog.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./loginDialog.component.css'],
})
export class LoginDialogWnd {

  @Input() loginUrl;
  constructor(public activeModal: NgbActiveModal) {
    
  }


  onload(event){
    console.log(event);
  }
}