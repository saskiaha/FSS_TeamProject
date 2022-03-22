import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { Overview } from './overview/overview.component';
import { Summary} from './summary/summary.component';
import { Article} from './article/article.component';
import { Values} from './values/values.component';
import { Methods} from './methods/methods.component';
import { Information} from './information/information.component';
import { DrillDownService } from './shared/drilldown.services';
import { FunctionService } from './shared/function.services';
import { SimpleService } from './shared/simple.services';
import { CheckUpService } from './shared/checkup.services';


import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@progress/kendo-angular-layout';
//import { RippleModule } from '@progress/kendo-angular-ripple';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { ChartsModule } from '@progress/kendo-angular-charts';
//import 'hammerjs';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { FormsModule } from '@angular/forms';
//import { GridModule } from '@progress/kendo-angular-grid';
declare var $: any;






@NgModule({
  declarations: [
    AppComponent,
    Overview,
    Summary,
    Article,
    Values,
    Methods,
    Information
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ButtonsModule,
    LayoutModule,
    //RippleModule,
    InputsModule,
    LabelModule,
    ChartsModule,
    DropDownsModule,
    FormsModule,
    //GridModule 
  ],
  providers: [DrillDownService, FunctionService, SimpleService, CheckUpService],
  bootstrap: [AppComponent]
})
export class AppModule { }
