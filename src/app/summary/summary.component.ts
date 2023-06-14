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

const article1 = require('assets/Article1.json');
const article2 = require('assets/Article2.json');
const article3 = require('assets/Article3.json');

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const articleNumber = urlParams.get('code');


@Component({
  selector: "app-summary",
  encapsulation: ViewEncapsulation.None,
  templateUrl: "./summary.component.html",
  styleUrls: ["./summary.component.scss"]
})
export class Summary implements OnInit, AfterViewInit {

  //@ViewChild('slider', { static: true }) slider: SliderComponent;
  @Output() dateChanged = new EventEmitter<any>();
  @Output() toggleChanged = new EventEmitter<any>();

  baseURL = "https://interactive-analytics.org:3001/"; //"http://127.0.0.1:5000/"
  hostElement; // Native element hosting the SVG container
  svg; // Top level SVG element
  g; // SVG Group element
  legend_Container;
  w = window;
  doc = document;
  el = this.doc.documentElement;
  body = this.doc.getElementsByTagName("body")[0];


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




        });
      });
  }

  ngOnInit() {
  }

  public ngAfterViewInit(): void {
    parent.postMessage("IframeLoaded", "*")
    //console.log('Site Loaded')

    this.createSummary();

  }

  createSummary() {
    var table: HTMLTableElement = <HTMLTableElement>document.getElementById("summaryTable");
    var articles = [article3, article2, article1];

    for (var i = 1; i < 4; i++) {
      var info = articles[i-1]['INFO'];
      var row = table.insertRow(1);
      row.id = info['ARTICLETEXT'];
      if (this.task == 4-i) {
        row.addEventListener('click', (e) => this.selectArticle(e));
      }

      var cellGrArticle = row.insertCell(0);
      var cellArticletext = row.insertCell(1);
      //var cellSBU = row.insertCell(3);
      //var cellCountry = row.insertCell(4);
      //var cellAlphacode = row.insertCell(5);
      var cellSegmentation = row.insertCell(2);
      var cellTSClass = row.insertCell(3);
      var cellSeasonal = row.insertCell(4);
      var cellABC = row.insertCell(5);
      var cellWarning = row.insertCell(6);
      var cellLockingP = row.insertCell(7);
      var cellSTFCLevel = row.insertCell(8);
      var cellSTFCMethod = row.insertCell(9);

      cellGrArticle.innerHTML = JSON.stringify(info['OBJECTNAME']).slice(14, -2);
      var artKey = JSON.stringify(info['ARTKEY']).split('_^!^_', 2);
      cellLockingP.innerHTML = artKey[1];
      cellArticletext.innerHTML = info['ARTICLETEXT'];
      //cellSBU.innerHTML = info['SBU'];
      //cellCountry.innerHTML = '-';
      //cellAlphacode.innerHTML = info['ALPHA'];
      cellSegmentation.innerHTML = info['SEGMENTATION'];
      cellTSClass.innerHTML = info['TSCLASS'];
      cellSeasonal.innerHTML = info['SEASONAL'];
      cellABC.innerHTML = info['ABC'];
      cellWarning.innerHTML = info['REMARK'];
      cellSTFCLevel.innerHTML = info['STFCLEVEL'];
      cellSTFCMethod.innerHTML = info['STFCMETHOD'];

    }
  }

  selectArticle(e) {
    var selectedArticle = e['path'][1].id;
    this.task = selectedArticle;
    document.getElementById("Article").style.display = 'block';
    document.getElementById("Summary").style.display = 'none';

    document.getElementById("navSummary").className = '';
    document.getElementById("navArticleForecast").className = 'selected';
    this.drillDownService.postData('Select Article', '');

  }



}

