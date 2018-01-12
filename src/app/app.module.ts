import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule} from  '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import { AppComponent } from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTooltipModule} from '@angular/material';
import {MatAutocompleteModule} from '@angular/material';
import {MatProgressBarModule} from '@angular/material';

import {NgTaxServices} from 'ng-tax-share-point-web-services-module';
import { NgGroupMembersComponent } from './ng-group-members/ng-group-members.component';

@NgModule({
  declarations: [
    AppComponent,
    NgGroupMembersComponent
  ],
  imports: [
    BrowserModule,BrowserAnimationsModule,MatProgressSpinnerModule,MatTooltipModule,MatAutocompleteModule,MatProgressBarModule,HttpClientModule,FormsModule,NgTaxServices.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
