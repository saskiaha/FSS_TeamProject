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

var Highcharts = require('highcharts');
// Load module after Highcharts is loaded
require('highcharts/modules/exporting')(Highcharts);
// Create the chart





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
  public mainChart = null;
  public ArticleName;
  public ArticleID;
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
          const queryString = window.location.search;
          const urlParams = new URLSearchParams(queryString);
          const articleNumber = urlParams.get('code');

          const article = this.getArticle(this.task);
          this.ArticleName = article['INFO']['ARTICLETEXT'];
          this.ArticleID = article['INFO']['GROUP_NAME'] + " - " + article['INFO']['ARTICLENAME'];


        });
      });
  }

  ngOnInit() {




  }

  public ngAfterViewInit(): void {
    var mainChart = this.mainChart;
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const articleNumber = urlParams.get('code');

    const article = this.getArticle(this.task);

    parent.postMessage("IframeLoaded", "*")
    //console.log('Site Loaded')
    this.createMainChart(article);




  }

  getArticle(num) {
    var data = 0;
    if (num == 1) {
      data = require("assets/Article1.json");
    } else if (num == 2) {
      data = require("assets/Article2.json");
    } else if (num == 3) {
      data = require("assets/Article3.json");
    }
    console.log(data);
    return data;
  }




  createMainChart(article) {
    var data = article['DATA'];
    var ooData = article['OODATA'];
    var methodsContent = article['METHODS_CONTENT'];
    var selectedMethod = methodsContent['METHODS'][0]['METHOD'];


    var actual = [];
    var actualSplit = [];
    var fc = [];
    var fcSplit = [];
    var openOrders = [];
    var openOrdersSplit = [];
    var openOrdersFinal = [];

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

    for (var i = 0; actualSplit.length + i < data.length; i++) {

      fc[i] = [data[actualSplit.length + i]['DATE'], data[actualSplit.length + i]['FORECAST']];

      //Bring date in correct format
      fcSplit[i] = [fc[i][0].split("-", 3), fc[i][1]];
      fcSplit[i] = [Date.UTC(fcSplit[i][0][0], (fcSplit[i][0][1] - 1), fcSplit[i][0][2]), fcSplit[i][1]];
    }





    for (var i = 0; i < ooData.length; i++) {
      openOrders[i] = [ooData[i]['DATE'], ooData[i]['VALUE']];
      openOrdersSplit[i] = [openOrders[i][0].split("-", 3), openOrders[i][1]];
      openOrdersSplit[i] = [Date.UTC(openOrdersSplit[i][0][0], (openOrdersSplit[i][0][1] - 1), openOrdersSplit[i][0][2]), openOrdersSplit[i][1]];
    }

    console.log(openOrdersSplit);

    for (var i = 0; i < fcSplit.length; i++) {
      openOrdersFinal[i] = [fcSplit[i][0], 0];
      for (var j = 0; j < openOrdersSplit.length; j++) {
        if (fcSplit[i][0] == openOrdersSplit[j][0]) {
          openOrdersFinal[i] = [openOrdersSplit[j][0], openOrdersSplit[j][1]];
        }
      }
    }

    fcSplit.unshift(actualSplit[actualSplit.length - 1]);

    this.mainChart = Highcharts.chart('container', {
      chart: {
        type: 'line',
        zoomType: 'x'
      },
      title: {
        text: 'Forecast'
      },
      xAxis: {
        type: 'datetime',
         plotLines: [{
           color: 'lightgray', // Red
          width: 1,
           value: 1625097600000,
           dashStyle: 'LongDash',
           label: {
             text: 'Short-Term',
             style: {
               color: 'lightgray',
             }

           }
         }, {
           color: 'lightgray', // Red
            width: 1,
           value: 1656633600000,
           dashStyle: 'LongDash',
           label: {
             text: 'Long-Term',
             style: {
               color: 'lightgray',
             }
           }
          },]
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
        data: actualSplit,
        color: 'black',
      }, {
          name: "Forecast (" + selectedMethod + ")",
        data: fcSplit,
        color: '#99D3ED',
      },
      {
        type: 'line',
        name: "Open Orders",
        data: openOrdersFinal,
        color: 'lightgreen',
      }]
    });

  }




  changeSubNav(target) {
    if (target == "Values") {
      document.getElementById("Values").style.display = 'block';
      document.getElementById("Information").style.display = 'none';
      document.getElementById("Methods").style.display = 'none';

      document.getElementById("valuesButton").className = 'selected';
      document.getElementById("valuesInformation").className = '';
      document.getElementById("valuesMethods").className = '';


    }
    else if (target == "Information") {
      document.getElementById("Information").style.display = 'block';
      document.getElementById("Values").style.display = 'none';
      document.getElementById("Methods").style.display = 'none';

      document.getElementById("valuesButton").className = '';
      document.getElementById("valuesInformation").className = 'selected';
      document.getElementById("valuesMethods").className = '';
    }
    else if (target == "Methods") {
      document.getElementById("Methods").style.display = 'block';
      document.getElementById("Values").style.display = 'none';
      document.getElementById("Information").style.display = 'none';

      document.getElementById("valuesButton").className = '';
      document.getElementById("valuesInformation").className = '';
      document.getElementById("valuesMethods").className = 'selected';
      for (var i = 0; i < Highcharts.charts.length; i++) {
        Highcharts.charts[i].reflow();
      }
    }
  }


}

function showChat() {
    throw new Error("Function not implemented.");
}
