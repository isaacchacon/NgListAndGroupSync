import { Component, OnInit,Input, Output, EventEmitter} from '@angular/core';

import {GroupEntry} from '../group-entry';
import {WorkerEntry} from '../worker-entry';
import {ListAndGroupManagement} from '../list-and-group-management'

@Component({
  selector: 'app-ng-group-members',
  templateUrl: './ng-group-members.component.html',
    styles:[`.taxActive {background-color: #D9EDF7 !important;}
			.taxTableRow {cursor:pointer;}
			
	`]
  //styleUrls: ['./ng-group-members.component.css']
})
export class NgGroupMembersComponent implements OnInit {
	
	@Input()
	businessClass:ListAndGroupManagement;
	
	
	///we need to get the group collection, and need to loop through it all, 
	/// for those cases where a sharepoint group is associated to more than one
	/// referral type.
	@Input()
	groups:GroupEntry[];
	
	private group:GroupEntry;
	
	@Input()
	set childGroup(group:GroupEntry){
		this.group = group;
		this.initialize();
	}
	
	@Output()
	onClosed = new EventEmitter<void>();
	
	initialize(){
		
		this.emailsToAdd = '';
		this.emailsToErase = [];
		this.clearErrors();
		
	}
	clearErrors(){
		this.successMessage  = '';
		this.errorAdding  = '';
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
		this.clearErrors();
		let reg:RegExp = /^(([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)(\s*;\s*|\s*$))+$/g
		let emailArrayEntered:string[];
		let filteredArray:string[]=[];//will hold non duplicates
		let duplicatedArray:string[]=[];//will hold duplicates
		this.emailsToAdd = this.emailsToAdd.trim();
		if(this.emailsToAdd.length>0){
			if(reg.test(this.emailsToAdd)){
				emailArrayEntered = this.businessClass.stringToArray(this.emailsToAdd);
				for(let x = 0;x<emailArrayEntered.length;x++){
					if(this.group.Workers.filter((worker)=>
						 worker.getEmail().toLowerCase().trim() == emailArrayEntered[x].toLowerCase().trim()
						).length==0){
						filteredArray.push(emailArrayEntered[x]);
					}
					else{
						duplicatedArray.push(emailArrayEntered[x]);
					}
				}
				if(filteredArray.length >0){	
					this.businessClass.addEmails(this.groups, this.group, filteredArray)
					.then((resultArray)=>{
						this.successMessage =resultArray.filter((result)=>
						//only count the ones that have no error and belong to the current referral type.
						(!result[1])&&(<WorkerEntry> result[0])[WorkerEntry.filterColumn]==this.group["Title"]
						).length+" emails were added!!";
						if(duplicatedArray.length > 0){
							this.successMessage+="\n The following emails were not added because were already part of the group: "+duplicatedArray.join(', ');
						}
						if(resultArray.filter((x)=>x[1]).length >0){
							//check for errors:
							this.errorAdding = "Error(s) occurred while adding: ";
							for(let result of resultArray){
								if(result[1]){
									this.errorAdding+="\n - "+result[1];
								}
							}
						}
						this.emailsToAdd = '';
					})
					.catch((error:any)=> this.errorAdding = "An error occurred while adding: "+(error.message || error));
				}
				else
					this.errorAdding='The specified email(s) already exist in this group';
			}
			else
				this.errorAdding='Invalid entry. Please enter an email or several emails delimited by a semi-colon.';
		}
		else
		this.errorAdding='Please enter an email or several emails delimited by a semi-colon';
  }
  
  removeSelected(){
	  this.clearErrors();
	  
	  
	  this.businessClass.removeEmails(this.groups, this.group,this.emailsToErase ).then((result) =>{
		if(result && result.length == 0 )
			this.successMessage = "Successfully removed the following emails: "+ this.emailsToErase.join(", ");
		else
		if(result)
			this.errorRemoving = "Error: "+ result.join(', ');
		else
			this.errorRemoving = "Error Removing the selected people."
		
		this.emailsToErase = [];
	  }).catch((error:any)=>this.errorRemoving = "An error Ocurred while Removing: "+ (error.message || error));
  }
  
  
  
  onWorkerClicked(worker:WorkerEntry){
	  if(this.emailsToErase.indexOf(worker.getEmail())>=0){
			this.emailsToErase.splice(this.emailsToErase.indexOf(worker.getEmail()), 1);
		}
		else{
			this.emailsToErase.push(worker.getEmail());
		}		
		this.errorAdding = '';
		this.successMessage ='';
		this.errorRemoving = '';
  }

}
