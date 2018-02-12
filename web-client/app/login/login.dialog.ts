import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material';

@Component({
  selector: 'login-dialog',
  templateUrl : './login.dialog.html'
})
export class LoginDialog {
  constructor(public dialogRef: MatDialogRef<LoginDialog>) { }
}