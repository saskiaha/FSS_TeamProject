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
import { stringify } from "@angular/compiler/src/util";
//import { DropDownListComponent } from '@progress/kendo-angular-dropdowns';

const article = require('assets/Article1.json');
var methodsContent = article['METHODS_CONTENT'];
var performance = methodsContent['PERF'];
var methods = methodsContent['METHODS'];
var info = article['INFO'];
var pp = methodsContent['PP'];
var Highcharts = require('highcharts');
require('highcharts/modules/exporting')(Highcharts);



document.addEventListener('DOMContentLoaded', function () {
  
});



@Component({
  selector: "app-methods",
  encapsulation: ViewEncapsulation.None,
  templateUrl: "./methods.component.html",
  styleUrls: ["./methods.component.scss"]
})
export class Methods implements OnInit, AfterViewInit {

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
  public chart2 = null;

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


    this.chart2 = Highcharts.chart('FCGraph2', {
      chart: {
        type: 'column',
      },
      legend: { enabled: false },
      title: {
        text: 'Forecast Errors',
        style: {
          fontSize: '10px',
        }

      },
      xAxis: {
        type: 'datetime'
      },

      plotOptions: {
        series: {
          pointStart: Date.UTC(2020, 6, 1),
          pointIntervalUnit: 'month'
        }
      },

      yAxis: {
      },

      series: [{
        data: []
      }]

    });
    var chart2 = this.chart2;


    //console.log('Site Loaded')
    this.createMethodsTable();
    this.createBTOptions();

    this.createGraph1();
    this.createGraph2();

    this.updateChart2();
  }


  updateChart2() {
    //const chart2 = Highcharts.chart('FCGraph2', {});
    var btFCStep: HTMLSelectElement = <HTMLSelectElement>document.getElementById("BTFCStep");
    var btMethod: HTMLSelectElement = <HTMLSelectElement>document.getElementById("BTMethod");

    var feData = [];
    var month = [];
    var selectedMethod = btMethod.value;
    var fcStep = btFCStep.value;

    for (var i = 0; i < pp.length; i++) {
      if (pp[i]['METHOD'] == selectedMethod && pp[i]['FCSTEP'] == fcStep) {
        month = pp[i]['DATE'].split("-", 3);
        month = [Date.UTC(month[0], month[1], month[2])];
        feData.push([month[0], pp[i]['ERROR']]);
      }
    }
    var newSeries = [{
      data: feData
    }];
    this.chart2.update({
      series: newSeries

    })

    console.log("Methode!");
  }


  createMethodsTable() {
    var table: HTMLTableElement = <HTMLTableElement>document.getElementById("methodTable");
  
    for (var i = 0; i < methods.length; i++) {
      var row = table.insertRow(i + 1);
      var countCell = row.insertCell(0);
      var methodCell = row.insertCell(1);
      var scoreCell = row.insertCell(2);
      countCell.innerHTML = stringify(i + 1);
      methodCell.innerHTML = methods[i]['METHOD'];
      scoreCell.innerHTML = methods[i]['SCORE'];
    }
  }


  createBTOptions() {
    var btMethod: HTMLSelectElement = <HTMLSelectElement>document.getElementById("BTMethod");
    var btPC: HTMLSelectElement = <HTMLSelectElement>document.getElementById("BTPC");
  
  
    for (var i = 0; i < methods.length; i++) {
      var opt = document.createElement('option');
      opt.value = methods[i]['METHOD'];
      opt.text = methods[i]['METHOD'];
      btMethod.add(opt, btMethod.options.length);
    }
  
  }


  createGraph1() {
    var btPC: HTMLSelectElement = <HTMLSelectElement>document.getElementById("BTPC");
    var btFCStep: HTMLSelectElement = <HTMLSelectElement>document.getElementById("BTFCStep");
    var btMethod: HTMLSelectElement = <HTMLSelectElement>document.getElementById("BTMethod");
    var performanceCriterionName;
    var performanceCriterion;
  
  
  
  
    var Highcharts = require('highcharts');
    // Load module after Highcharts is loaded
    require('highcharts/modules/exporting')(Highcharts);
    btPC.value = info['CRITERION'];
    switch (info['CRITERION']) {
      case 'FCA': performanceCriterionName = "Forecast Accuracy"; break;
      case 'PIS': performanceCriterionName = "Periods in Stock"; break;
      default: performanceCriterionName = "Performance Criterion";
  
    }  btPC.value = info['CRITERION'];
    switch (info['CRITERION']) {
      case 'FCA': performanceCriterionName = "Forecast Accuracy"; break;
      case 'PIS': performanceCriterionName = "Periods in Stock"; break;
      default: performanceCriterionName = "Performance Criterion";
  
    }
    var pcData;
    var pcData2 = [];
    var pcData3 = [];
    var fcStep = btFCStep.value;
    for (var i = 0; i < performance.length; i++) {
      if (performance[i]['FCSTEP'] == 2) {
        pcData2.push([performance[i]['METHOD'], performance[i]['MSE'], performance[i]['FCA'], performance[i]['MAPE'], performance[i]['PIS'], performance[i]['MAE'], performance[i]['ME'], performance[i]['MASE'], performance[i]['RMSE'], performance[i]['SMAPE'], performance[i]['SAPIS'], performance[i]['ACR'], performance[i]['MAR'], performance[i]['MSR']]);
      }
      if (performance[i]['FCSTEP'] == 3) {
        pcData3.push([performance[i]['METHOD'], performance[i]['MSE'], performance[i]['FCA'], performance[i]['MAPE'], performance[i]['PIS'], performance[i]['MAE'], performance[i]['ME'], performance[i]['MASE'], performance[i]['RMSE'], performance[i]['SMAPE'], performance[i]['SAPIS'], performance[i]['ACR'], performance[i]['MAR'], performance[i]['MSR']]);
      }
  
    }
  
    if (fcStep == "2") {
      pcData = pcData2
    }
  
    if (fcStep == "3") {
      pcData = pcData2
    }
  
    var performanceIndex
    switch (btPC.value) {
      case 'MSE': performanceIndex = 1; break;
      case 'FCA': performanceIndex = 2; break;
      case 'MAPE': performanceIndex = 3; break;
      case 'PIS': performanceIndex = 4; break;
      case 'MAE': performanceIndex = 5; break;
      case 'ME': performanceIndex = 6; break;
      case 'MASE': performanceIndex = 7; break;
      case 'RMSE': performanceIndex = 8; break;
      case 'SMAPE': performanceIndex = 9; break;
      case 'SAPIS': performanceIndex = 10; break;
      case 'ACR': performanceIndex = 11; break;
      case 'MAR': performanceIndex = 12; break;
      case 'MSR': performanceIndex = 13; break;
    }
  
    for (var i = 0; i < pcData.length; i++) {
      pcData[i] = [pcData[i][0], pcData[i][performanceIndex]];
    }
  
  
  
    document.addEventListener('DOMContentLoaded', function () {
      const chart = Highcharts.chart('FCGraph1', {
        chart: {
          type: 'column',
          reflow: true
        },
        legend: { enabled: false },
        title: {
          text: performanceCriterionName,
          style: {
            fontSize: '10px',
          }
        },
        xAxis: {
          type: 'category'
        },
  
        yAxis: {
        },
  
        series: [{
          name: performanceCriterionName,
          data: pcData
        }, {
        }]
      });
  
    });
  
  }
  
  
  createGraph2() {
    var btFCStep: HTMLSelectElement = <HTMLSelectElement>document.getElementById("BTFCStep");
  
    // Load module after Highcharts is loaded
  }

}

















