import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule} from  '@angular/forms';
import {HttpModule} from '@angular/http';
import { AppComponent } from './app.component';

import {NgTaxServices} from 'ng-tax-share-point-web-services-module';
import { NgGroupMembersComponent } from './ng-group-members/ng-group-members.component';

@NgModule({
  declarations: [
    AppComponent,
    NgGroupMembersComponent
  ],
  imports: [
    BrowserModule,FormsModule ,HttpModule,NgTaxServices.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
