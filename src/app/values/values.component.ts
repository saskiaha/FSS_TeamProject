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







@Component({
  selector: "app-values",
  encapsulation: ViewEncapsulation.None,
  templateUrl: "./values.component.html",
  styleUrls: ["./values.component.scss"]
})
export class Values implements OnInit, AfterViewInit {

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
  public article;
  public data;

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
          this.data = this.article['DATA'];



        });
      });
  }

  ngOnInit() {
  }

  public ngAfterViewInit(): void {
    parent.postMessage("IframeLoaded", "*")
    //console.log('Site Loaded')

    this.createFCTable();
  }


  createFCTable() {
    var table: HTMLTableElement = <HTMLTableElement>document.getElementById("fcTable");
    var startIndex = this.createStartRow();
    this.createHistoricData(startIndex);

  }

  createStartRow() {
    var table: HTMLTableElement = <HTMLTableElement>document.getElementById("fcTable");
    var startYear;
    var startMonth;
    var sum = 0;
    var data = this.article["DATA"];
    startYear = data[0]['DATE'].substring(0, 4);
    startMonth = data[0]['DATE'].substring(5, 7);
    var startRow = table.insertRow(1);
    var yearCell = startRow.insertCell(0);


    for (var i = 1; i < startMonth; i++) {
      var emptyCell = startRow.insertCell(i);
      emptyCell.innerHTML = "";
    }

    for (i = startMonth; i < 13; i++) {
      var cell = startRow.insertCell(i);
      cell.innerHTML = Math.trunc(data[(i - startMonth)]['ACTUAL']).toString();
      sum = (sum + parseInt(data[(i - startMonth)]['ACTUAL']));
    }


    var sumCell = startRow.insertCell(13);
    sumCell.innerHTML = Math.trunc(sum).toString();
    yearCell.innerHTML = startYear;

    return (13 - startMonth);
  }

  createHistoricData(startIndex: number) {
    var table: HTMLTableElement = <HTMLTableElement>document.getElementById("fcTable");
    var fc = false;
    var j = 1;

    var stopNum = 9

    if (this.task == String(3)) {
      stopNum = 7;

    }

    for (var i = 2; i < stopNum; i++) {
      var row = table.insertRow(i);
      var yearCell = row.insertCell(0);
      var data = this.data;
      yearCell.innerHTML = data[startIndex]['DATE'].substring(0, 4);

      var sum = 0;
      let stop = false;

      for (j = 1; j < 13; j++) {

        if (data[startIndex]) {
          var cell = row.insertCell(j);
          if (data[startIndex]['ACTUAL'] >= 0) {
            cell.innerHTML = Math.trunc(data[startIndex]['ACTUAL']).toString();
            sum = sum + this.data[startIndex]['ACTUAL'];
            startIndex = startIndex + 1;
          } else {
            fc = true;
            cell.innerHTML = Math.trunc(data[startIndex]['FORECAST']).toString();
            cell.style.color = '#99D3ED';
            sum = sum + data[startIndex]['FORECAST'];
            startIndex = startIndex + 1;
          }
        }
        else {
          stop = true;
          while (j < 13) {
            row.insertCell(j);
            j++;
          }
        }
      }
      if (!stop) {
        var sumCell = row.insertCell(13);
        sumCell.innerHTML = Math.trunc(sum).toString();
        if (fc) {
          sumCell.style.color = '#99D3ED';
        }
      } else {

        var sumCell = row.insertCell(13);
        sumCell.innerHTML = Math.trunc(sum).toString();
        if (fc) {
          sumCell.style.color = '#99D3ED';
        }
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
  return data;
}
}
