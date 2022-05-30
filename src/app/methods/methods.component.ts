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

var Highcharts = require('highcharts');
require('highcharts/modules/exporting')(Highcharts);
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const articleNumber = urlParams.get('code');





@Component({
  selector: "app-methods",
  encapsulation: ViewEncapsulation.None,
  templateUrl: "./methods.component.html",
  styleUrls: ["./methods.component.scss"]
})
export class Methods implements OnInit, AfterViewInit {

  //@ViewChild('slider', { static: true }) slider: SliderComponent;
  //@Output() dated = new EventEmitter<any>();

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
  public chart1 = null;
  public chart2 = null;
  public mainChart = null;
  public selected = [];
  public article;


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
          this.article = this.getArticle(this.task);


        });


      });


  }

  ngOnInit() {
  }

  public ngAfterViewInit(): void {
    parent.postMessage("IframeLoaded", "*")


    var chart1 = this.chart1;
    var chart2 = this.chart2;
    var mainChart = this.mainChart;


    //console.log('Site Loaded')
    this.createMethodsTable();
    this.createBTOptions();

    this.createChart1();
    this.createChart2();

    this.updateCharts();


    setTimeout(this.chart2.reflow(), 2000);

  }

  updateChart2() {
    var article = this.article;
    var btFCStep: HTMLSelectElement = <HTMLSelectElement>document.getElementById("BTFCStep");
    var btMethod: HTMLSelectElement = <HTMLSelectElement>document.getElementById("BTMethod");

    var feData = [];
    var month = [];
    var selectedMethod = btMethod.value;
    var fcStep = btFCStep.value;

    var methodsContent = article['METHODS_CONTENT'];
    var pp = methodsContent['PP'];

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
    this.chart2.reflow();
  }


  createMethodsTable() {
    var table: HTMLTableElement = <HTMLTableElement>document.getElementById("methodTable");
    var article = this.article;
    var methodsContent = article['METHODS_CONTENT'];
    var performance = methodsContent['PERF'];
    var methods = methodsContent['METHODS'];
    var info = article['INFO'];
    var pp = methodsContent['PP'];

    for (var i = 0; i < methods.length; i++) {
      var row = table.insertRow(i + 1);
      var countCell = row.insertCell(0);
      var methodCell = row.insertCell(1);
      var scoreCell = row.insertCell(2);
      /*countCell.id = methods[i]['METHOD'];
      countCell.className = methods[i]['METHOD'];
      methodCell.id = methods[i]['METHOD'];
      methodCell.className = methods[i]['METHOD'];
      scoreCell.id = methods[i]['METHOD'];
      scoreCell.className = methods[i]['METHOD'];*/
      row.id = methods[i]['METHOD'];
      row.className = methods[i]['METHOD'];
      countCell.innerHTML = stringify(i + 1);
      methodCell.innerHTML = methods[i]['METHOD'];
      row.addEventListener('click', (e) => this.selectMethod(e));
      scoreCell.innerHTML = stringify(i + 1);
    }
  }


  createBTOptions() {
    var btMethod: HTMLSelectElement = <HTMLSelectElement>document.getElementById("BTMethod");
    var btPC: HTMLSelectElement = <HTMLSelectElement>document.getElementById("BTPC");
    var btFCStep: HTMLSelectElement = <HTMLSelectElement>document.getElementById("BTFCStep");
    var article = this.article;
    var methodsContent = article['METHODS_CONTENT'];
    var performance = methodsContent['PERF'];
    var methods = methodsContent['METHODS'];
    var info = article['INFO'];
    var pp = methodsContent['PP'];

    if (this.task == 3) {
      btFCStep.value = "3";
    }
  
  
    for (var i = 0; i < methods.length; i++) {
      var opt = document.createElement('option');
      opt.value = methods[i]['METHOD'];
      opt.text = methods[i]['METHOD'];
      btMethod.add(opt, btMethod.options.length);
    }
  
  }

  createOtherFCs() {
    var article = this.article;
    var methodsContent = article['METHODS_CONTENT'];
    var performance = methodsContent['PERF'];
    var info = article['INFO'];
    var pp = methodsContent['PP'];

    var fcData = methodsContent['FC'];
    var methods = []
    for (var i = 0; i < fcData.length; i++) {
      if (fcData[i]['FCSTEP'] == "1") {
        methods.push(fcData[i]['METHOD']);
      }
    }


    for (var j = 0; j < methods.length; j++) {
      methods[j] = new Array(methods[j], []);

      for (var i = 0; i < fcData.length; i++) {
        if (fcData[i]['METHOD'] == methods[j][0]) {
          var date = fcData[i]['DATE'].split("-", 3);
          date = Date.UTC(date[0], (date[1] - 1), date[2]);
          methods[j].push([date, fcData[i]['FORECAST_ADAPTED']]);
        }
      }
    }
    return methods;

  }

  updateChart1() {
    var btFCStep: HTMLSelectElement = <HTMLSelectElement>document.getElementById("BTFCStep");
    var btMethod: HTMLSelectElement = <HTMLSelectElement>document.getElementById("BTMethod");
    var btPC: HTMLSelectElement = <HTMLSelectElement>document.getElementById("BTPC");
    var performanceCriterionName;
    var performanceIndex;
    var article = this.article;
    var methodsContent = article['METHODS_CONTENT'];
    var performance = methodsContent['PERF'];


    var fcStep = btFCStep.value;
    var pcData = [];

    switch (btPC.value) {
      case 'FCA': performanceCriterionName = "Forecast Accuracy"; fcStep = '2';break;
      case 'PIS': performanceCriterionName = "Periods in Stock"; fcStep = '3'; break;
      case 'MSE': performanceCriterionName = "Mean Square Error"; break;
      case 'ME': performanceCriterionName = "Mean Error"; break;
      case 'ABC': performanceCriterionName = "ABC"; break;
      default: performanceCriterionName = "Performance Criterion";

    }



    for (var i = 0; i < performance.length; i++) {
  
      if (performance[i]['FCSTEP'] == fcStep) {
        pcData.push([performance[i]['METHOD'], performance[i]['MSE'], performance[i]['FCA'], performance[i]['MAPE'], performance[i]['PIS'], performance[i]['MAE'], performance[i]['ME'], performance[i]['MASE'], performance[i]['RMSE'], performance[i]['SMAPE'], performance[i]['SAPIS'], performance[i]['ACR'], performance[i]['MAR'], performance[i]['MSR']]);

      }

    }

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

    this.chart1.update({
      series: [{
        data: pcData
      }],
      title: {
        text: performanceCriterionName
      }
    })
    this.chart1.reflow();
  }

  createChart1() {
    var btPC: HTMLSelectElement = <HTMLSelectElement>document.getElementById("BTPC");
    var btFCStep: HTMLSelectElement = <HTMLSelectElement>document.getElementById("BTFCStep");
    var btMethod: HTMLSelectElement = <HTMLSelectElement>document.getElementById("BTMethod");
    var performanceCriterionName;
    var article = this.article;
    var methodsContent = article['METHODS_CONTENT'];
    var performance = methodsContent['PERF'];
    var methods = methodsContent['METHODS'];
    var info = article['INFO'];
    var pp = methodsContent['PP'];
 
    btPC.value = info['CRITERION'];
  
  
  

      this.chart1 = Highcharts.chart('FCGraph1', {
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
          type: 'category',
          labels: {
            style: {
              fontSize: '10px',
            },
          }
        },
  
        yAxis: {
          labels: {
            style: {
              fontSize: '10px',
            }
          }
        },
  
        series: [{
          name: performanceCriterionName,
          data: []
        }, {
        }]
      });
 
  
  }
  
  
  createChart2() {
    var btFCStep: HTMLSelectElement = <HTMLSelectElement>document.getElementById("BTFCStep");

    var methodsContent = this.article['METHODS_CONTENT'];
    var performance = methodsContent['PERF'];
    var methods = methodsContent['METHODS'];
    var info = this.article['INFO'];
    var pp = methodsContent['PP'];

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
        type: 'datetime',
        labels: {
          style: {
            fontSize: '10px',
          },
        }
      },

      plotOptions: {
        series: {
          pointStart: Date.UTC(2020, 6, 1),
          pointIntervalUnit: 'month'
        }

      },

      yAxis: {
        labels: {
          style: {
            fontSize: '10px',
          }
        }
      },

      series: [{
        data: []
      }]

    });
    // Load module after Highcharts is loaded
  }

  updateCharts() {
    this.updateChart1();
    this.updateChart2();
  }

  selectMethod(id) {
    var methods = this.createOtherFCs();
    var selectedMethod = id['path'][1].id;
    var selectedMethodData = [];
    var mainChart = Highcharts.charts[2];

    var methodsContent = this.article['METHODS_CONTENT'];
    var performance = methodsContent['PERF'];
    var info = this.article['INFO'];
    var pp = methodsContent['PP'];


    if (!this.selected.includes(selectedMethod)) {

      this.selected.push(selectedMethod);

      for (var i = 0; i < methods.length; i++) {
        if (methods[i][0] == selectedMethod) {
          selectedMethodData = methods[i];
        }
      }
      selectedMethodData.splice(0, 2);
      mainChart.addSeries({
        data: selectedMethodData,
        name: selectedMethod,
        color: "#D9534F"

      })

      var color = mainChart.series[mainChart.series.length - 1].color;
      const row = Array.from(document.getElementsByClassName(selectedMethod) as HTMLCollectionOf<HTMLElement>);

      for (i = 0; i < row.length; i++) {
        if (row[i].id != selectedMethod) {
          row.splice(i, 1);
        } 
      }
      row.forEach(element => element.style.backgroundColor = color);





      mainChart.reflow();
    } else {
      const row = Array.from(document.getElementsByClassName(selectedMethod) as HTMLCollectionOf<HTMLElement>);

      for (i = 0; i < row.length; i++) {
        if (row[i].id != selectedMethod) {
          row.splice(i, 1);
        }
      }
      row.forEach(element => element.style.backgroundColor = 'transparent');
      var seriesLength = mainChart.series.length;
      for (var i = seriesLength - 1; i > -1; i--) {
        if (mainChart.series[i].name == selectedMethod)
          mainChart.series[i].remove();
        
      }
      var index = this.selected.indexOf(selectedMethod, 0);
      if (index !== -1) {
        console.log(this.selected);
        console.log(index);
        console.log(this.selected[index]);
        console.log(selectedMethod);
        this.selected.splice(index, 1);
      }


}
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
}


















