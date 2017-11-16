import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {GroupEntry} from './group-entry';
//import {MOCKGROUPS} from './mock-tax-sp-groups';
import {ListAndGroupManagement} from './list-and-group-management'
import {SharepointListsWebService} from 'ng-tax-share-point-web-services-module';




@Component({
  selector: 'app-root',
  styles:[`.taxActive {background-color: #D9EDF7 !important;}
			.taxTableRow {cursor:pointer;}
			
	`],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title:string= "Hello NgListANdGroupSync";
	searchTerm:string;
	groups: GroupEntry[] ;
	listAndGroupManagement:ListAndGroupManagement;
	
	constructor(private sharepointListsWebService: SharepointListsWebService){
		this.listAndGroupManagement = new ListAndGroupManagement(this.sharepointListsWebService);
	}
	
	ngOnInit():void{
		this.listAndGroupManagement.loadListsAndGroups().then
			(result => this.groups = <GroupEntry[]>result);
	}
	
	
	search(){	
	}
	
	
}
