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

//import data from '../assets/Article1.json'

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


@Component({
  selector: "app-article",
  encapsulation: ViewEncapsulation.None,
  templateUrl: "./article.component.html",
  styleUrls: ["./article.component.scss"]
})
export class Article implements OnInit, AfterViewInit {

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


  }

  changeSubNav(target){
    if(target == "Values"){
      document.getElementById("Values").style.display = 'block';
      document.getElementById("Information").style.display = 'none';
      document.getElementById("Methods").style.display = 'none';

      document.getElementById("valuesButton").className = 'selected';
      document.getElementById("valuesInformation").className = '';
      document.getElementById("valuesMethods").className = '';


    }
    else if(target == "Information"){
      document.getElementById("Information").style.display = 'block';
      document.getElementById("Values").style.display = 'none';
      document.getElementById("Methods").style.display = 'none';

      document.getElementById("valuesButton").className = '';
      document.getElementById("valuesInformation").className = 'selected';
      document.getElementById("valuesMethods").className = '';
    }
    else if(target == "Methods"){
      document.getElementById("Methods").style.display = 'block';
      document.getElementById("Values").style.display = 'none';
      document.getElementById("Information").style.display = 'none';

      document.getElementById("valuesButton").className = '';
      document.getElementById("valuesInformation").className = '';
      document.getElementById("valuesMethods").className = 'selected';
    }
  }

}
var Highcharts = require('highcharts');
// Load module after Highcharts is loaded
require('highcharts/modules/exporting')(Highcharts);
// Create the chart

const article = require('assets/Article1.json');

var data = article['DATA'];
var actual = [];
var actualSplit = [];
var fc = [];
var fcSplit = [];
console.log(data);
for (var i = 0; i < data.length; i++) {

  actual[i] = [data[i]['DATE'], data[i]['ACTUAL']];

  //Bring date in correct format
  actualSplit[i] = [actual[i][0].split("-", 3), actual[i][1]];
  actualSplit[i] = [Date.UTC(actualSplit[i][0][0], (actualSplit[i][0][1] - 1), actualSplit[i][0][2]), actualSplit[i][1]];

  if (actualSplit[i][1] == undefined) {
    actualSplit.pop();
    break;
  }
}

fcSplit[0] = actualSplit[actualSplit.length - 1];
for (var i = 1; actualSplit.length + i < data.length; i++) {
  console.log(data[actualSplit.length + i]);

  fc[i] = [data[actualSplit.length + i]['DATE'], data[actualSplit.length+ i]['FORECAST']];

  //Bring date in correct format
  fcSplit[i] = [fc[i][0].split("-", 3), fc[i][1]];
  fcSplit[i] = [Date.UTC(fcSplit[i][0][0], (fcSplit[i][0][1] - 1), fcSplit[i][0][2]), fcSplit[i][1]];
}
console.log(fcSplit);

document.addEventListener('DOMContentLoaded', function () {
  const chart = Highcharts.chart('container', {
    chart: {
      type: 'line',
      zoomType: 'x'
    },
    title: {
      text: 'Forecast'
    },
    xAxis: {
      type:'datetime'
    },

    plotOptions: {
      series: {
        pointStart: Date.UTC(2015, 0, 1),
        pointIntervalUnit: 'month'
      }
    },

    yAxis: {
    },

    series: [{
      name: "Actual Demand",
      data: actualSplit
    }, {
      name: "Forecast",
      data: fcSplit
      }]
  });
});
