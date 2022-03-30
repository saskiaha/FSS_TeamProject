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

/**
 * Declares the WebChat property on the window object.
 */
declare global {
  interface Window {
    WebChat: any;
  }
}



window.WebChat = window.WebChat || {};

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

  //Conversational Agent
  public directLine;
  public store;
  public componentMessage = null;
  public messengerID = null;
  public animate = false;
  public noSpeechInteraction = true;


  //Dashboard
  public status = "Summary"



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


    this.store = window.WebChat.createStore(
      {},
      ({ dispatch }) => next => action => {
        if (action.type === 'DIRECT_LINE/POST_ACTIVITY') {
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

    }, 1000);

  }

  public ngAfterViewInit(): void {

    window.addEventListener('webchatincomingactivity', this.webChatHandler.bind(this));
    window.addEventListener("message", this.messageHandler.bind(this), false);

  }

  public ngAfterContentInit() {
    this.initialize();
  }



  public async webChatHandler(event) {
    var sheight = document.querySelectorAll("[class$=webchat__basic-transcript__scrollable]")[0].scrollHeight;
    document.querySelectorAll("[class$=webchat__basic-transcript__scrollable]")[0].scrollTo({ left: 0, top: sheight, behavior: 'auto' });
    this.noSpeechInteraction = false;
    if ((this.router.url.includes("unitedstates") || this.router.url == "/") && (new Date((<any>event).data.timestamp) >= this.currentTime)) {  //
      console.log(<any>event)
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
      this.status = "Summary"
    }
    else if(target == "Article Forecast"){
      document.getElementById("Article").style.display = 'block';
      document.getElementById("Summary").style.display = 'none';
      this.status = "Article"

    }
  }

  hideChat(){
    document.getElementById("chatIcon").style.display = 'block';
    document.getElementById("webChat").style.display = 'none';
  }

  showChat(){
    document.getElementById("webChat").style.display = 'block';
    document.getElementById("chatIcon").style.display = 'none';
  }

}


