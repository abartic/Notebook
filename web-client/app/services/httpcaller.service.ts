
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Http, Response, RequestOptionsArgs, ResponseContentType } from '@angular/http';
import { Router } from '@angular/router';
//import { forkJoin } from 'rxjs/observable/forkJoin';
import 'rxjs/add/observable/forkJoin';

@Injectable()
export class HttpCallerService {

  constructor(private router: Router, private http: Http) { }

  public callPost(url: string, pack: Object, cb: ((result: any) => void), errcb: ((result: any) => void), ignoreError?: boolean) {

    this.http.post(url, pack)
      .subscribe(resp => {
        const result = resp.json();
        if ((result.error === undefined || result.error === null) &&
          (result.errors === undefined || result.errors === null)) {
          cb(result);
        }
        else if ((result.error !== undefined && (result.error.status === 401 || result.error.code === 401)) ||
          (result.errors !== undefined && result.code === 401)) {

          if (!ignoreError) {
            this.router.navigate(['/login']);
          }
          else {
            errcb(401);
          }
        }
        else {
          errcb(result.error);
        }
      });
  }

  public callPdf(url: string, pack: Object, cb: ((result: any) => void), errcb: ((result: any) => void), ignoreError?: boolean) {

    let options: RequestOptionsArgs = <RequestOptionsArgs>{};
    options.responseType = ResponseContentType.Blob;
    this.http.post(url, pack, options)
      .subscribe(result => {
        var file = new Blob([result.blob()], { type: 'application/pdf' });
        var fileURL = URL.createObjectURL(file);
        cb(fileURL);
      }, error => {
        errcb(error);
      });

    
  }

  public callPosts(packs: Array<[string, Object]>, cb: ((result: any) => void), errcb: ((result: any) => void)) {

    let calls: Array<Observable<Response>> = [];
    for (let pack of packs) {
      calls.push(this.http.post(pack["0"], pack["1"]));
    }

    Observable.forkJoin(calls)
      .subscribe(resps => {
        let results = [];
        let navigate = false;
        let error = null;
        for (let resp of resps) {
          const result = resp.json();
          if (!result)
            continue;

          if ((result.error === undefined || result.error === null) &&
            (result.errors === undefined || result.errors === null)) {
            results.push(result);
          }
          else if ((result.error !== undefined && (result.error.status === 401 || result.error.code === 401)) ||
            (result.errors !== undefined && result.code === 401)) {
            navigate = true;
            break;
          }
          else {
            error = result.error;
            break;
          }
        }

        if (navigate)
          this.router.navigate(['/login']);
        else if (error)
          errcb(error);
        else
          cb(results);
      });
  }

  public callGet(url: string, cb: ((result: any) => void), errcb: ((result: any) => void)) {

    this.http.get(url)
      .subscribe(resp => {
        const result = resp.json();
        if ((result.error === undefined || result.error === null) &&
          (result.errors === undefined || result.errors === null)) {
          cb(result);
        }
        else if ((result.error !== undefined && (result.error.status === 401 || result.error.code === 401)) ||
          (result.errors !== undefined && result.code === 401)) {
          this.router.navigate(['/login']);
        }
        else {
          errcb(result.error);
        }
      });
  }
}
