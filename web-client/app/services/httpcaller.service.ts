


import { Observable } from 'rxjs/Observable';
import { Injectable, Injector } from '@angular/core';
//import { Http, Response, RequestOptionsArgs, ResponseContentType } from '@angular/http';
import { Router } from '@angular/router';
//import { forkJoin } from 'rxjs/observable/forkJoin';
import 'rxjs/add/observable/forkJoin';
import { HttpClient } from '@angular/common/http';
import { UserSession } from '../common/userSession';
import { environment } from '../../environments/environment';


interface HttpResponse {
  error: HttpResponseError;
  errors: HttpResponseError[];
  code: number
}

interface HttpResponseError {
  status: number;
  code: number;
}


@Injectable({
  providedIn: 'root',
})
export class HttpCallerService {

  
  constructor( private injector: Injector, private http: HttpClient) {
  }

  public get router(): Router { 
    return this.injector.get(Router);
 }

  public callPost(url: string, pack: Object, cb: ((result: any) => void), errcb: ((result: any) => void), ignoreError?: boolean) {

    this.http.post<HttpResponse>(environment.baseUrlServices + url, pack, { responseType: 'json' })
      .subscribe(result => {

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
      }, error => {

        errcb(error);
      });
  }

  public callPdf(url: string, userSession: UserSession, pack: Object, cb: ((result: any) => void), errcb: ((result: any) => void), ignoreError?: boolean) {

    let language = 'en';
    if (userSession && userSession.Language !== 'en')
      language = userSession.Language;

    // let options: RequestOptionsArgs = <RequestOptionsArgs>{};
    // options.responseType = ResponseContentType.Blob;
    this.http.post(environment.baseUrlServices + url, pack, {
      headers: {
        'Accept-Language': language
      },
      responseType: 'blob'
    })
      .subscribe(result => {
        //var file = new Blob([result.blob()], { type: 'application/pdf' });
        var file = new Blob([result], { type: 'application/pdf' });
        var fileURL = URL.createObjectURL(file);
        cb(fileURL);
      }, error => {

        errcb(error);
      });


  }

  public callPosts(packs: Array<[string, Object]>, cb: ((result: any) => void), errcb: ((result: any) => void)) {

    let calls: Array<Observable<HttpResponse>> = [];
    for (let pack of packs) {
      calls.push(this.http.post<HttpResponse>(environment.baseUrlServices+ pack["0"], pack["1"]));
    }

    Observable.forkJoin(calls)
      .subscribe(resps => {
        let results = [];
        let navigate = false;
        let error = null;
        for (let result of resps) {
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
      }, error => {

        errcb(error);
      });
  }



  public callGet(url: string, cb: ((result: any) => void), errcb: ((result: any) => void)) {
    
    this.http.get<HttpResponse>(environment.baseUrlServices + url)
      .subscribe(result => {

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
      }, error => {

        errcb(error);
      });
  }
}

