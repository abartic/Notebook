
import { BaseEntity } from './../../../../server/models/base-entity';
import { Package } from './package';
import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { ModelInfos } from '../../../../server/models/modelProperties';
import { HttpCallerService } from '../../services/httpcaller.service';
import { PackageController, IPackageController } from './package-controller';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { ModelFactory } from '../../../../server/models/modelFactory';
import { CookieService } from 'ngx-cookie-service';
import { WebDataRocksPivot } from '../../webdatarocks/webdatarocks.angular4';


function instanceOfIPackageController(object: any): object is IPackageController {
  return 'member' in object;
}

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
  animations: [routerTransition()]
})
export class FormComponent implements OnInit {


  private packageCtrl: IPackageController
  constructor(private route: ActivatedRoute, private router: Router, private cookieService: CookieService, ) {

  }

  get package() {
    return this.packageCtrl === null ? null : this.packageCtrl.package;
  }

  get entityType() {
    return this.packageCtrl.entityType;
  }

  ngOnInit() {
    this.route.data
      .subscribe(data => {

        let packCtrl = <IPackageController>data['packCtrl'];
        if (packCtrl.package_initialized === true) {
          this.packageCtrl = packCtrl;
        }
        else {
          let errorcode = data['packCtrl'];
          this.router.navigate(['/error', { errorcode: errorcode }]);
        }

      }, error => {
        this.router.navigate(['/error', { errorcode: error }]);
      });
  }



}
