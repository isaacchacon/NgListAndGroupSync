import { Component, OnInit,Input, Output, EventEmitter} from '@angular/core';

import {GroupEntry} from '../group-entry';
import {WorkerEntry} from '../worker-entry';

@Component({
  selector: 'app-ng-group-members',
  templateUrl: './ng-group-members.component.html',
    styles:[`.taxActive {background-color: #D9EDF7 !important;}
			.taxTableRow {cursor:pointer;}
			
	`],
  styleUrls: ['./ng-group-members.component.css']
})
export class NgGroupMembersComponent implements OnInit {
	
	@Input()
	
	private group:GroupEntry;
	set childGroup(group:GroupEntry){
		this.group = group;
		this.initialize();
	}
	
	@Output()
	onClosed = new EventEmitter<void>();
	
	initialize(){
		this.successMessage  = '';
		this.errorAdding  = '';
		this.emailsToAdd = '';
		this.emailsToErase = [];
		this.errorRemoving = '';
	}
	
	successMessage:string;
	errorAdding:string;
	emailsToAdd:string;
	emailsToErase:string[]=[];
	errorRemoving:string;

  constructor() { }

  ngOnInit() {
  }
  
  add(){
  }
  
  removeSelected(){
  }
  
  onWorkerClicked(worker:WorkerEntry){
	  
  }

}
