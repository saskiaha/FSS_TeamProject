import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Overview } from './overview/overview.component';

const routes: Routes = [
  //{ path: 'counties/:selectedState/:selectedMetric/:selectedDate/:userID/:treatment/:task', component: CountiesComponent },
  { path: ':userID/:treatment/:task', component: Overview },
  { path: '', component: Overview }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
