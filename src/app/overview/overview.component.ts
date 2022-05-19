import { Component, OnInit, OnDestroy, ElementRef, AfterViewInit, AfterContentInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ViewChild } from '@angular/core';
import { Summary } from '../summary/summary.component';
import { Article } from '../article/article.component';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { DrillDownService } from "../shared/drilldown.services";
import { FunctionService } from "../shared/function.services";
import { SimpleService } from "../shared/simple.services";
import { CheckUpService } from '../shared/checkup.services';

import {
  formatDate
} from '@angular/common';
import { Console } from 'console';
import { line } from 'd3';
import { typeWithParameters } from '@angular/compiler/src/render3/util';
//import * as jBox from 'jbox';
import 'jbox/dist/jBox.all.css';

/**
 * Declares the WebChat property on the window object.
 */
declare global {
  interface Window {
    WebChat: any;
  }
}



window.WebChat = window.WebChat || {};
var Highcharts = require('highcharts');
require('highcharts/modules/exporting')(Highcharts);

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class Overview implements OnInit, OnDestroy, AfterViewInit, AfterContentInit {

  @ViewChild('summary', { static: true }) summary: Summary;
  @ViewChild('article', { static: true }) article: Article;
  @ViewChild("botWindow", { static: true }) botWindowElement: ElementRef;

  private _routerSub = Subscription.EMPTY;
  refreshInterval;
  nextInterval;

  //Experimental Data
  public userID;
  public currentTime;
  public treatment;
  public task;
  public manualUsed = false;

  //Conversational Agent
  public directLine;
  public store;
  public componentMessage = null;
  public messengerID = null;
  public animate = false;
  public noSpeechInteraction = true;


  //Dashboard
  public status = "Summary"
  public timeLeft = 0



  constructor(
    private router: Router,
    public route: ActivatedRoute,
    private drillDownService: DrillDownService,
    private functionService: FunctionService,
    private simpleService: SimpleService,
    private checkUpService: CheckUpService
  ) {

    this._routerSub = router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.route.params.subscribe(params => {

        if (this.route.snapshot.params['userID']) {
          this.userID = this.route.snapshot.params['userID'];
        }
        else {
          this.userID = "0000000";
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
      });
    });

  }

  async ngOnInit() {

    this.currentTime = new Date()

  
    this.directLine = window.WebChat.createDirectLine({
      secret: "HYu5FsTVYRQ.wTHsKFRVqkikwtfPkPycQSwinUKFioVZyspa5inuD_0",
      webSocket: false
    });


    /*
    async function createHybridPonyfillFactory() {
      const speechServicesPonyfillFactory = await window.WebChat.createCognitiveServicesSpeechServicesPonyfillFactory({
        credentials: {
          region: 'eastus',
          subscriptionKey: 'ae8ac8ac8b3244d5a976a30ced9b1298'
        }
      });

      return (options) => {
        const speech = speechServicesPonyfillFactory(options);

        return {
          SpeechGrammarList: speech.SpeechGrammarList,
          SpeechRecognition: speech.SpeechRecognition,
          speechSynthesis: null, // speech.speechSynthesis,
          SpeechSynthesisUtterance: null, // speech.SpeechSynthesisUtterance
        };
      }
    };
*/
    //Get treatment
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const art = urlParams.get('code');


    this.store = window.WebChat.createStore(
      {},
      ({ dispatch }) => next => action => {
        if (action.type === 'DIRECT_LINE/POST_ACTIVITY') {
          // Dehighlight after Message is sent
          this.dehighlight();

          //connect outgoing event handler and hand over reported data
          const event = new Event('webchatoutgoingactivity');
          action.payload.activity.channelData = {Task: this.task, Treatment: this.treatment, UserID: this.userID, Level: this.status };
          var find = '([0-9]),([0-9])';
          var re = new RegExp(find, 'g');
          action.payload.activity.text = String(action.payload.activity.text).replace(re, '$1$2');
          (<any>event).data = action.payload.activity;
          window.dispatchEvent(event);
        }
        else if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
          const event = new Event('webchatincomingactivity');
          (<any>event).data = action.payload.activity;
          window.dispatchEvent(event);

        }
        return next(action);
      });



    window.WebChat.renderWebChat(
      {
        directLine: this.directLine,
        sendTypingIndicator: true,
        sendTyping: true,
        styleOptions: {
          botAvatarBackgroundColor: 'rgba(0, 0, 0)',
          hideUploadButton: true,
          bubbleBorderWidth: 0,
          bubbleBackground: '#e6e2e27a',
          bubbleFromUserBorderWidth: 0,
          bubbleFromUserBorderColor: 'black',
          sendBoxButtonColor: 'rgba(255,153, 0, 1)',
          sendBoxButtonColorOnFocus: 'rgba(255,153, 0, 1)',
          sendBoxButtonColorOnHover: 'rgba(255,153, 0, 1)',
          sendBoxHeight: 40,
          bubbleMinHeight: 0,
          bubbleMaxWidth: 450,
          paddingRegular: 5
        },
        //webSpeechPonyfillFactory: await createHybridPonyfillFactory(),
        locale: 'en-US',
        store: this.store,
        overrideLocalizedStrings: {
          TEXT_INPUT_PLACEHOLDER: 'Type here...'//'Click on the microphone and speak OR type ...'
        }

      },
      this.botWindowElement.nativeElement

    );

    
    this.directLine
      .postActivity({
        from: { id: "USER_ID", name: "USER_NAME" },
        name: "requestWelcomeDialog",
        type: "event",
      })
      .subscribe(
        id => {
        },
        error => console.log(`Error posting activity ${error}`)
      );
      

  }


  ngOnDestroy() {
    this.currentTime = new Date(8640000000000000);
    this.directLine = null;
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    window.removeEventListener('webchatincomingactivity', this.webChatHandler.bind(this));
    window.removeEventListener("message", this.messageHandler.bind(this), false);
    this.store = null;
  }

  initialize() {




    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    this.refreshInterval = setInterval(() => {
      if(this.timeLeft > 0){
        this.timeLeft -= 1
      }
      else{
        this.dehighlight();
      }

    }, 1000);

  }

  public ngAfterViewInit(): void {

    window.addEventListener('webchatincomingactivity', this.webChatHandler.bind(this));
    window.addEventListener("message", this.messageHandler.bind(this), false);

    var tooltips = document.getElementsByClassName('fas fa-info-circle');
    for (var i = 0; i < tooltips.length; i++) {
      tooltips[i].addEventListener('mouseover', (e) => this.countHover(e));
    }
  }

  public ngAfterContentInit() {
    this.initialize();

  }



  public async webChatHandler(event) {
    var sheight = document.querySelectorAll("[class$=webchat__basic-transcript__scrollable]")[0].scrollHeight;
    document.querySelectorAll("[class$=webchat__basic-transcript__scrollable]")[0].scrollTo({ left: 0, top: sheight, behavior: 'auto' });
    this.noSpeechInteraction = false;
    if ((<any>event).data.type == 'event') {  //
      console.log(<any>event)
      if((<any>event).data.name == 'SystemExp')
        this.highlight((<any>event).data.value)
      }
      else if ((<any>event).data.type == 'message' && (<any>event).data.from.name != 'Conversational-ITL') {


          if ((<any>event).data.channelData.speech != null) {
            //console.log("speech");
            //this.drillDownService.postSpeech(this.userID, this.task, this.treatment, 1, (<any>event).data.text, "State");
          }
          else {
            //console.log("nospeech");
            //this.drillDownService.postSpeech(this.userID, this.task, this.treatment, 0, (<any>event).data.text, "State");
          }
        
      }
      else if ((<any>event).data.type == 'message' && (<any>event).data.from.name == 'Conversational-ITL') {

      }
    }

  public messageHandler(event) {

    if ("https://iism-im-survey.iism.kit.edu" != event.origin)
      return;
    const { action, value } = event.data
    if ((this.router.url.includes("unitedstates") || this.router.url == "/") && (action == 'end') && (new Date() >= this.currentTime)) {
      //this.drillDownService.post(this.userID, this.task, this.treatment, "Task Ended", value, { site: "UnitedStates", date: this.unitedStatesMap.date, statesSelected: this.unitedStatesMap.statesSelect }, 0);
    }
    else if ((this.router.url.includes("unitedstates") || this.router.url == "/") && (action == 'start') && (sessionStorage.getItem('taskNr') != value) && (new Date() >= this.currentTime)) {
      this.reload(value)
    }
  }

  reload(value) {
    //this.drillDownService.post(this.userID, this.task, this.treatment, "Task Started", value, { site: "UnitedStates", date: this.unitedStatesMap.date, statesSelected: this.unitedStatesMap.statesSelect }, 0);
    sessionStorage.setItem('taskNr', value);

    //this.router.navigate(['/unitedstates/Total Cases/2020-12-02/' + this.unitedStatesMap.userID + '/' + this.unitedStatesMap.treatment + "/" + value]);
  }


  communicateToBot(value: any) {
    this.directLine
      .postActivity({
        from: { id: "USER_ID", name: "USER_NAME" },
        name: "chatbotNotification",
        type: "event",
        value: value
      })
      .subscribe(
        id => {
          if (sessionStorage.getItem('conversationID') == null) {
            sessionStorage.setItem('conversationID', this.directLine.conversationId);
          };
        },
        error => console.log(`Error posting activity ${error}`)
      );
  }


  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  changeNav(target){
    if(target == "Summary"){
      document.getElementById("Summary").style.display = 'block';
      document.getElementById("Article").style.display = 'none';

      document.getElementById("navSummary").className = 'selected';
      document.getElementById("navArticleForecast").className = '';
      this.status = "Summary"
    }
    else if(target == "Article Forecast"){
      document.getElementById("Article").style.display = 'block';
      document.getElementById("Summary").style.display = 'none';

      document.getElementById("navSummary").className = '';
      document.getElementById("navArticleForecast").className = 'selected';

      this.status = "Article"

    }
  }

  openManual() {
    window.open('assets/ADFUserManual.pdf', 'ADF User Manual');
    this.manualUsed = true;
  }

  hideChat(){
    document.getElementById("chatIcon").style.display = 'block';
    document.getElementById("webChat").style.display = 'none';
    document.getElementById("main").style.width = '98%';
    for (var i = 0; i < Highcharts.charts.length; i++) {
      Highcharts.charts[i].reflow();
    }
    this.dehighlight();

  }

  showChat(){
    document.getElementById("webChat").style.display = 'block';
    document.getElementById("chatIcon").style.display = 'none';
    document.getElementById("main").style.width = '75%';
    for (var i = 0; i < Highcharts.charts.length; i++) {
      Highcharts.charts[i].reflow();
    }
    this.highlight("Package Size");
  }

  highlight(term) {
    this.dehighlight();

    this.timeLeft = 30
    switch (term) {
      case "GrArticle":
        if (this.status == "Summary") {
          var table: HTMLTableElement = <HTMLTableElement>document.getElementById("summaryTable");
          for (var r = 0, n = table.rows.length; r < n; r++) {
            table.rows[r].cells[0].classList.add("highlight");
          }
        }
        break;
      case "Locking Period":
        if (this.status == "Summary") {
          var table: HTMLTableElement = <HTMLTableElement>document.getElementById("summaryTable");
          for (var r = 0, n = table.rows.length; r < n; r++) {
            table.rows[r].cells[1].classList.add("highlight");
          }
        }
        break;
      case "Article Text":
        if (this.status == "Summary") {
          var table: HTMLTableElement = <HTMLTableElement>document.getElementById("summaryTable");
          for (var r = 0, n = table.rows.length; r < n; r++) {
            table.rows[r].cells[2].classList.add("highlight");
          }
          
        }
        document.getElementById("subMenuBar").children[0].classList.add("highlight");
        document.getElementById("subMenuBar").children[1].classList.add("highlight");
        document.getElementById("subMenuBar").children[2].classList.add("highlight");
        break;
      case "SBU":
          var table: HTMLTableElement = <HTMLTableElement>document.getElementById("summaryTable");
          for (var r = 0, n = table.rows.length; r < n; r++) {
            table.rows[r].cells[3].classList.add("highlight");
          }
        if (!document.getElementById("valuesInformation").classList.contains("selected")) {
          document.getElementById("valuesInformation").classList.add("highlight");
        }
        document.getElementById("FMBoxWide").firstElementChild.children[1].children[2].classList.add("highlightBox");
        break;
      case "High-Touch":
      case "Low-Touch":
      case "No-Touch":
      case "Random":
      case "Segmentation":
          var table: HTMLTableElement = <HTMLTableElement>document.getElementById("summaryTable");
        for (var r = 0, n = table.rows.length; r < n; r++) {
          table.rows[r].cells[6].classList.add("highlight");
        }
            if (!document.getElementById("valuesInformation").classList.contains("selected")) {
              document.getElementById("valuesInformation").classList.add("highlight");
            }
            document.getElementById("FMBoxWide").firstElementChild.children[2].firstElementChild.classList.add("highlightBox");
        
        break;
      case "TS Class":
        if (this.status == "Summary") {
          var table: HTMLTableElement = <HTMLTableElement>document.getElementById("summaryTable");
          for (var r = 0, n = table.rows.length; r < n; r++) {
            table.rows[r].cells[7].classList.add("highlight");
          }
        }
        break;
      case "Seasonal":
        if (this.status == "Summary") {
          var table: HTMLTableElement = <HTMLTableElement>document.getElementById("summaryTable");
          for (var r = 0, n = table.rows.length; r < n; r++) {
            table.rows[r].cells[8].classList.add("highlight");
          }
        }
        break;
      case "ABC":
        if (this.status == "Summary") {
          var table: HTMLTableElement = <HTMLTableElement>document.getElementById("summaryTable");
          for (var r = 0, n = table.rows.length; r < n; r++) {
            table.rows[r].cells[9].classList.add("highlight");
          }
        }
        break;
      case "STFC Level":
          var table: HTMLTableElement = <HTMLTableElement>document.getElementById("summaryTable");
          for (var r = 0, n = table.rows.length; r < n; r++) {
            table.rows[r].cells[11].classList.add("highlight");
          }
        if (!document.getElementById("valuesInformation").classList.contains("selected")) {
          document.getElementById("valuesInformation").classList.add("highlight");
        }
        document.getElementById("FMBoxShort").firstElementChild.lastElementChild.classList.add("highlightBox");
        break;
      case "STFC Method":
          var table: HTMLTableElement = <HTMLTableElement>document.getElementById("summaryTable");
          for (var r = 0, n = table.rows.length; r < n; r++) {
            table.rows[r].cells[12].classList.add("highlight");
            if (!document.getElementById("valuesInformation").classList.contains("selected")) {
              document.getElementById("valuesInformation").classList.add("highlight");
            }
            document.getElementById("FMBoxShort").firstElementChild.children[2].classList.add("highlightBox");
        }
        break;

      case "Article Forecast":
          document.getElementById("navArticleForecast").classList.add("highlightPos");
        break;
      case "Time Series":
        if (this.status == "Summary") {
          document.getElementById("navArticleForecast").classList.add("highlightPos");
        }
        document.getElementById("container").classList.add("highlight");
        document.getElementById("Values").classList.add("highlight");
        if (!document.getElementById("valuesButton").classList.contains("selected")) {
           document.getElementById("valuesButton").classList.add("highlight");
        }
        break;
      case "Package Size":
        if (this.status == "Summary") {
          document.getElementById("navArticleForecast").classList.add("highlightPos");
        }
        if (!document.getElementById("valuesInformation").classList.contains("selected")) {
          document.getElementById("valuesInformation").classList.add("highlight");
        }
        document.getElementById("FMBoxWide").firstElementChild.children[2].children[1].classList.add("highlightBox");
        break;
      case "Data-based Package Size":
        if (this.status == "Summary") {
          document.getElementById("navArticleForecast").classList.add("highlightPos");
        }
        if (!document.getElementById("valuesInformation").classList.contains("selected")) {
          document.getElementById("valuesInformation").classList.add("highlight");
        }
        document.getElementById("FMBoxWide").firstElementChild.children[2].children[2].classList.add("highlightBox");
        break;
      case "Historical Data":
        if (this.status == "Summary") {
          document.getElementById("navArticleForecast").classList.add("highlightPos");

        }
        if (!document.getElementById("valuesButton").classList.contains("selected")) {
          document.getElementById("valuesButton").classList.add("highlight");
        }
        document.getElementById("subMenu").classList.add("highlight");
        break;
    }
    var time = 20;
    this.refreshInterval = setInterval(() => {
      time--;
      if (time == 0) {
        this.dehighlight();
      }

    }, 1000);

  
  }

    dehighlight() {

      var elems = document.querySelectorAll(".highlight");

      [].forEach.call(elems, function (el) {
        el.classList.remove("highlight");
      });

      var elems = document.querySelectorAll(".highlightPos");

      [].forEach.call(elems, function (el) {
        el.classList.remove("highlightPos");
      });

      var elems = document.querySelectorAll(".highlightBox");

      [].forEach.call(elems, function (el) {
        el.classList.remove("highlightBox");
      });
    

  }counth

  countHover(e) {
    var startTime = Date.now();
    var id = e['target'].id;
    var element = document.getElementById(id);

    element.onmouseout = function () {
      var endTime = Date.now();
      var duration = endTime - startTime;
      if (duration > 1000) {
        console.log(id + ": " + duration);
      }
    }
  }


}


