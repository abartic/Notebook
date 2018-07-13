
import { BaseEntity } from './../../../../server/models/base-entity';
import { Package } from './package';
import { Component, OnInit, Inject } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { ModelInfos } from '../../../../server/models/modelProperties';
import { HttpCallerService } from '../../services/httpcaller.service';
import { PackageController, IPackageController } from './package-controller';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { ModelFactory } from '../../../../server/models/modelFactory';




@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
  animations: [routerTransition()]
})
export class FormComponent implements OnInit {

  private packageCtrl: IPackageController
  constructor(private route: ActivatedRoute, private router: Router) {
  }

  get package() {
    return this.packageCtrl === null ? null : this.packageCtrl.package;
  }

  ngOnInit() {
    this.route.data
      .subscribe(data => {
        if (data['packCtrl'] === 401) ///credential error
            this.router.navigate(['/login']);

        this.packageCtrl = <IPackageController>data['packCtrl'];
      });
  }
}
