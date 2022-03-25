import {
  Component,
  OnInit,
  ElementRef,
  ViewEncapsulation,
  ChangeDetectorRef,
  ViewChild,
  EventEmitter,
  Output,
  Input,
  AfterViewInit
} from "@angular/core";

import {
  Location
} from '@angular/common';
import {
  formatDate
} from '@angular/common';


import {
  Subscription
} from "rxjs";
import {
  Router,
  NavigationEnd,
  ActivatedRoute
} from "@angular/router";
import { HttpClient } from '@angular/common/http';
import { filter } from "rxjs/operators";
import { DrillDownService } from "../shared/drilldown.services";
import { SliderComponent } from '@progress/kendo-angular-inputs';
import { Console } from "console";
//import { DropDownListComponent } from '@progress/kendo-angular-dropdowns';

import * as $ from 'jquery';

@Component({
  selector: "app-information",
  encapsulation: ViewEncapsulation.None,
  templateUrl: "./information.component.html",
  styleUrls: ["./information.component.scss"]
})
export class Information implements OnInit, AfterViewInit {

  //@ViewChild('slider', { static: true }) slider: SliderComponent;
  //@Output() dateChanged = new EventEmitter<any>();

  baseURL = "https://interactive-analytics.org:3001/"; //"http://127.0.0.1:5000/"
  hostElement; // Native element hosting the SVG container
  svg; // Top level SVG element
  g; // SVG Group element
  legend_Container;
  w = window;
  doc = document;
  el = this.doc.documentElement;
  body = this.doc.getElementsByTagName("body")[0];
  AggregationLevel: string = '';
  ArticleID: string = '';
  SBU: string = '';
  Country: string = '';
  AlphaCode: string = '';
  Segmentation: string = '';
  PackageSize: string = '';
  DBPackageSize: string = '';
  HistoricalData: string = '';
  NonZero: string = '';
  TSClass: string = '';
  Seasonal: string = '';
  AvgDemand: string = '';
  STMethod: string = '';
  STPeriod: string = '';
  STLevel: string = '';
  LTMethod: string = '';
  LTPeriod: string = '';
  LTLevel: string = '';

  private _routerSub = Subscription.EMPTY;

  public userID;
  public treatment;
  public task;

  constructor(
    private elRef: ElementRef,
    public router: Router,
    public route: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private drillDownService: DrillDownService,
    private location: Location,
    private http: HttpClient
  ) {

    this.location = location;
    this.hostElement = this.elRef.nativeElement;

    this._routerSub = router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.route.params.subscribe(params => {

          if (this.route.snapshot.params['userID']) {
            this.userID = this.route.snapshot.params['userID'];
          }
          else {
            this.userID = "0000000"
          }

          if (this.route.snapshot.params['treatment']) {
            this.treatment = this.route.snapshot.params['treatment'];
          }
          else {
            this.treatment = "0";
          }

          if (this.route.snapshot.params['task']) {
            this.task = this.route.snapshot.params['task'];
          }
          else {
            this.task = "0";
          }


          // Go to homepage default
          if (this.router.url === "/") {
            this.location.go(this.userID + "/" + this.treatment + "/" + this.task);
          }

          if (this.router.url.indexOf('/unitedstates') != -1 || this.router.url === "/") {

          }
          /**/
          const article = require('assets/Article1.json');
          var info = article['INFO'];
          this.AggregationLevel = info['DATALEVEL'];
          this.ArticleID = info['ARTICLENAME'];
          this.SBU = info['SBU'];
          this.Country = info['COUNTRY'];
          this.AlphaCode = info['ALPHA'];
          this.Segmentation = info['SEGMENTATION'];
          this.PackageSize = info['PACKAGE_SIZE_SYS'];
          this.DBPackageSize = info['PACKAGE_SIZE_DB'];
          this.HistoricalData = info['LENGTH'];
          this.NonZero = info['PNZ'];
          this.TSClass = info['TSCLASS'];
          this.Seasonal = 'No';
          this.AvgDemand = info['AVSALES'];
          this.STMethod = info['STFCMETHOD'];
          this.STPeriod = info['STHORIZON'] + ' months';
          this.STLevel = info['STFCLEVEL'];
          this.LTMethod = info['LTFCMETHOD'];
          this.LTPeriod = info['LTHORIZON'] + ' months';
          this.LTLevel = info['LTFCLEVEL'];;




        });
      });
  }

  ngOnInit() {
  }

  public ngAfterViewInit(): void {
    parent.postMessage("IframeLoaded", "*")
    //console.log('Site Loaded')


  }







}


