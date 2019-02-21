import { Component, OnInit } from '@angular/core';
import { HttpCallerService } from '../../services/httpcaller.service';
import { routerTransition } from '../../router.animations';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-sheets',
  templateUrl: './sheets.component.html',
  styleUrls: ['./sheets.component.css'],
  animations: [routerTransition()]
})
export class SheetsComponent implements OnInit {

  public response: string = null;
  public user: string = '';

  constructor(private httpCaller: HttpCallerService) { }

  ngOnInit() {

  }

  private getError(err): string {
    if (err === null || err === undefined)
      return 'generic error';
    else if (err instanceof String)
      return err.toString();
    else if (err instanceof HttpErrorResponse)
      return err.message;
    else if (err['error'])
      return this.getError(err['error']);
    else
      return JSON.stringify(err);

  }

  onCreateSheets() {
    this.response = null;
    this.httpCaller.callPost(
      '/sheetdata/create-spreadsheet',
      {
        spreadsheetNames: ['inventory', 'movements', 'partners', 'budgets', 'settings', 'system']
      },
      result => {
        if (result.error)
          this.response = result.error;
        else {
          this.response = 'Sheets created.';
          this.user = null;
        }
      },
      err => {
        this.response = 'Error: ' + this.getError(err);
      });
  }

  onEnrollingUser() {
    this.response = null;
    this.httpCaller.callPost(
      '/sheetdata/enrolle-user-spreadsheet',
      {
        user: this.user.trim()
      },
      result => {

        if (result.error)
          this.response = result.error;
        else {
          this.response = 'Used enrolled.';
          this.user = null;
        }
      },
      err => {
        this.response = 'Error: ' + this.getError(err);
      });
  }

  onDisenrollingUser() {
    this.response = null;
    this.httpCaller.callPost(
      '/sheetdata/disenrolle-user-spreadsheet',
      {
        user: this.user.trim()
      },
      result => {

        if (result.error)
          this.response = result.error;
        else {
          this.response = 'Used disenrolled.';
          this.user = null;
        }
      },
      err => {
        this.response = 'Error: ' + this.getError(err);
      });
  }


  onDeleteMetadata() {
    this.response = null;
    this.httpCaller.callPost(
      '/sheetdata/delete-metadata',
      {
        spreadsheetNames: ['inventory', 'movements', 'partners', 'budgets', 'settings']
      },
      result => {
        if (result.error)
          this.response = result.error;
        else {
          this.response = 'Metadata deleted!';
        }
      },
      err => {
        this.response = 'Error: ' + this.getError(err);
      });
  }

}
