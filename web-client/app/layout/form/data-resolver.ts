
import { Injectable, Inject } from '@angular/core';
import {
    Router, Resolve, RouterStateSnapshot,
    ActivatedRouteSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { HttpCallerService } from '../../services/httpcaller.service';
import { ModelFactory } from '../../../../server/models/modelFactory';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PackageController, IPackageController } from './package-controller';
import { UserSessionService } from '../../services/userSessionService';




@Injectable()
export class DataResolver implements Resolve<IPackageController> {
    constructor(private router: Router,
        @Inject(NgbModal) private modalService,
        @Inject(HttpCallerService) private httpCaller,
        @Inject(UserSessionService) private userSessionService: UserSessionService) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IPackageController> {

        let param = route.paramMap.get('id');
        let type = ModelFactory.uniqueInstance.get(param);
        if (type === undefined || type === null) {
            console.log('screen missing...');
            this.router.navigate(['/not-found']);
            return Observable.of(null);
        }
        else {
            let packageCtrl = new PackageController(param, type, this.modalService, this.httpCaller, this.userSessionService, this.router);

            return new Observable<IPackageController>((observer) => {
                packageCtrl.fetchEntityInfo().then(() => {
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