import { BaseEntity } from './../../../../server/models/base-entity';
import { SharedPipesModule } from './../../shared/pipes/shared-pipes.module';
import { Package } from './package';
import { Component, OnInit, Inject } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { ModelInfos } from '../../../../server/models/modelProperties';
import { HttpCallerService } from '../../services/httpcaller.service';
import { PackageController, IPackageController } from './package-controller';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { ModelFactory } from '../../../../server/models/modelFactory';




@Component({
  selector: 'app-form1',
  templateUrl: './form1.component.html',
  styleUrls: ['./form1.component.css'],
  animations: [routerTransition()]
})
export class Form1Component implements OnInit {
  
  private packageCtrl : IPackageController
  constructor(private route: ActivatedRoute, @Inject(NgbModal) private modalService, @Inject(HttpCallerService) private httpCaller) { 
    let param = this.route.params['value']['id'];
    let type = ModelFactory.uniqueInstance.get(param);
    
    this.packageCtrl = new PackageController(param, type, modalService, httpCaller);
    
  }
  
  get package() {
    return this.packageCtrl.package;
  }

  ngOnInit(){
    

  }
}
