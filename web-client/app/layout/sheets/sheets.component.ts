import { Component, OnInit } from '@angular/core';
import { HttpCallerService } from '../../services/httpcaller.service';
import { routerTransition } from '../../router.animations';

@Component({
  selector: 'app-sheets',
  templateUrl: './sheets.component.html',
  styleUrls: ['./sheets.component.css'],
  animations: [routerTransition()]
})
export class SheetsComponent implements OnInit {

  public response: string = null;
  public enrolledUser : string = '';

  constructor(private httpCaller: HttpCallerService) { }

  ngOnInit() {

  }

  onCreateSheets() {
    this.response = null;
    this.httpCaller.callPost(
      '/sheetdata/create-spreadsheet',
      {
        spreadsheetNames: ['inventory', 'movements', 'partners', 'budgets', 'settings']
      },
      result => {
        if (result.error)
          this.response = result.error;
        else
        {
          this.response = 'Sheets created.';
          this.enrolledUser = null;
        }
      },
      err => {
        this.response = 'Error - ' + err;
      });
  }

  onEnrollingUser() {
    this.response = null;
    this.httpCaller.callPost(
      '/sheetdata/enrolle-user-spreadsheet',
      {
        enrolledUser : this.enrolledUser.trim()
      },
      result => {
        
        if (result.error)
          this.response = result.error;
        else
        {
          this.response = 'Used enrolled.';
          this.enrolledUser = null;
        }
      },
      err => {
        this.response = 'Error - ' + err;
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
        else
        {
          this.response = 'Metadata deleted!';
        }
      },
      err => {
        this.response = 'Error - ' + err;
      });
  }
  
}
