
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Router } from '@angular/router';

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
          else
          {
            errcb(401);
          }
        }
        else {
          errcb(result.error);
        }
      });
  }

  public callPosts(packs: Array<[string, Object]>, cb: ((result: any) => void), errcb: ((result: any) => void)) {

    let call: Observable<Response> = undefined;
    for (let pack of packs) {
      if (!call) {
        call = this.http.post(pack["0"], pack["1"]);
      }
      else {
        call = call.merge(this.http.post(pack["0"], pack["1"]));
      }
    }

    call.subscribe(resp => {
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
