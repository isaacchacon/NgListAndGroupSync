import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';


import {GroupEntry} from './group-entry';
import {WorkerEntry} from './worker-entry';
import {TaxSpUser} from 'ng-tax-share-point-web-services-module';
import {ListAndGroupManagement} from './list-and-group-management'

import {SharepointUserGroupWebService} from 'ng-tax-share-point-web-services-module';
import {SharepointListsWebService} from 'ng-tax-share-point-web-services-module';
import {UrlService} from 'ng-tax-share-point-web-services-module';




@Component({
  selector: 'app-root',
  styles:[`.taxActive {background-color: #D9EDF7 !important;}
			.taxPointerCursor {cursor:pointer;}
			.taxSearchFound {background-color:yellow;}
			
	`],
  templateUrl: './app.component.html'
 // styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
	searchTerm:string;
	groups: GroupEntry[] ;
	selectedGroup:GroupEntry;
	originalGroups:GroupEntry[];
	listAndGroupManagement:ListAndGroupManagement;
	
	constructor(private sharepointListsWebService: SharepointListsWebService, 
				private sharepointUserGroupWebService:SharepointUserGroupWebService, 
				private urlService:UrlService){
		this.listAndGroupManagement = new ListAndGroupManagement(this.sharepointListsWebService, this.sharepointUserGroupWebService, this.urlService);
	}
	
	ngOnInit():void{
		this.listAndGroupManagement.loadListsAndGroups().then
			(result => this.groups = result);
	}
	
	
	search(){	
		if(this.searchTerm){
			if(this.originalGroups==null){
				this.originalGroups = this.groups;
			}
			this.groups = this.groups.filter(this.filterGroupEntry, this);
		}
		else if (this.originalGroups){
			this.groups = this.originalGroups;
			this.originalGroups = null;
		}
		
	}
	
	filterGroupEntry(entry:GroupEntry):boolean{
		return entry.Workers.filter(this.filterWorkerEntry, this).length>0
			|| entry.Owners.filter(this.filterOwnerEntry, this).length>0;
	}	
	filterWorkerEntry(entry:WorkerEntry):boolean{
		return entry.getEmail().toLowerCase().trim().indexOf(this.searchTerm.toLowerCase().trim())>=0;
	}	
	filterOwnerEntry(entry:TaxSpUser):boolean{
		if(entry.email)
		return entry.email.toLowerCase().trim().indexOf(this.searchTerm.toLowerCase().trim())>=0;
		else
		return entry.displayName.toLowerCase().trim().indexOf(this.searchTerm.toLowerCase().trim())>=0;	
	}
	
	onSelect(group:GroupEntry):void{
		this.selectedGroup = group;
	}
	
	closeSelectedGroup():void{
		this.selectedGroup = null;
	}	
}
