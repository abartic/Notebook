import { Package } from './package';
import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';

@Component({
  selector: 'app-form1',
  templateUrl: './form1.component.html',
  styleUrls: ['./form1.component.css'],
  animations: [routerTransition()]
})
export class Form1Component implements OnInit {

  constructor() { }
  package : Package;
  ngOnInit() {
    ;
    
  }

}
