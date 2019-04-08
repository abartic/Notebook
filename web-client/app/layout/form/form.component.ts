import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { IPackageController } from './ipackage-controller';
import { ActivatedRoute, Router } from '@angular/router';




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
        this.router.navigate(['/error', { errorcode: JSON.stringify(error) }]);
      });
  }

  
}
