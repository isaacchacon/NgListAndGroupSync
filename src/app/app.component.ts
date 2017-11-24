import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';


import {GroupEntry} from './group-entry';
import {WorkerEntry} from './worker-entry';
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
	searchTerm:string;
	groups: GroupEntry[] ;
	selectedGroup:GroupEntry;
	originalGroups:GroupEntry[];
	listAndGroupManagement:ListAndGroupManagement;
	
	constructor(private sharepointListsWebService: SharepointListsWebService){
		this.listAndGroupManagement = new ListAndGroupManagement(this.sharepointListsWebService);
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
		return entry.Workers.filter(this.filterWorkerEntry, this).length>0;
	}	
	filterWorkerEntry(entry:WorkerEntry):boolean{
		return entry.getEmail().toLowerCase().indexOf(this.searchTerm.toLowerCase())>=0;
	}	
	
	showWorkersEmails(workers:WorkerEntry[]):string{
		let stringResult = '';
		if(workers)
		for(let worker of workers){
			stringResult+=worker.getEmail()+"; ";
		}
		return stringResult;
	}
	
	onSelect(group:GroupEntry):void{
		this.selectedGroup = group;
	}
	
	closeSelectedGroup():void{
		this.selectedGroup = null;
	}
	
	
	
}
