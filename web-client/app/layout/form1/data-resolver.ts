
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




@Injectable()
export class DataResolver implements Resolve<IPackageController> {
    constructor(private router: Router,
        @Inject(NgbModal) private modalService,
        @Inject(HttpCallerService) private httpCaller) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IPackageController> {

        let param = route.paramMap.get('id');
        let type = ModelFactory.uniqueInstance.get(param);
        let packageCtrl = new PackageController(param, type, this.modalService, this.httpCaller);

        return new Observable<IPackageController>((observer) => {
            packageCtrl.fetchEntityInfo().then(() => {
                observer.next(packageCtrl);
                observer.complete();
            }).catch((err) => {
                observer.next(err);
                observer.complete();
            });
        });



    }
}