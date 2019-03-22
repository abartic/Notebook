import { TranslateService } from '@ngx-translate/core';
import { ModelInfos } from './../../../../server/models/modelProperties';

import { Injectable, Inject } from '@angular/core';
import {
    Router, Resolve, RouterStateSnapshot,
    ActivatedRouteSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { HttpCallerService } from '../../services/httpcaller.service';
import { ModelFactory } from '../../../../server/models/modelFactory';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PackageController } from './package-controller';
import { UserSessionService } from '../../services/userSessionService';
import { IPackageController } from './ipackage-controller';




@Injectable()
export class DataResolver implements Resolve<IPackageController> {
    constructor(private router: Router,
        @Inject(NgbModal) private modalService,
        @Inject(HttpCallerService) private httpCaller,
        @Inject(UserSessionService) private userSessionService: UserSessionService,
        @Inject(TranslateService) private translateService: TranslateService) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IPackageController> {

        let param = route.paramMap.get('id');
        let type = ModelFactory.uniqueInstance.get(param);
        let info = ModelInfos.uniqueInstance.get(param);
        if (type === undefined || type === null) {
            console.log('screen missing...');
            this.router.navigate(['/not-found']);
            return Observable.of(null);
        }
        else {
            let packageCtrl = new PackageController(param, type, this.modalService, this.httpCaller, this.userSessionService, this.router, this.translateService);

            return new Observable<IPackageController>((observer) => {
                packageCtrl.fetchEntityInfo(info).then(() => {
                    observer.next(packageCtrl);
                    
                    observer.complete();
                }).catch((err) => {
                    observer.error(err);
                    observer.complete();
                });
            });
        }
    }
}