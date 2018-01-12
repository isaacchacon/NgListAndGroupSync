import { Component, OnInit,Input, Output, EventEmitter} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { ViewChild } from '@angular/core';
 import { MatAutocompleteTrigger } from '@angular/material';

import {UserInfoListEntry } from 'ng-tax-share-point-web-services-module';

import {GroupEntry} from '../group-entry';
import {WorkerEntry} from '../worker-entry';
import {ListAndGroupManagement} from '../list-and-group-management'


import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';


@Component({
  selector: 'app-ng-group-members',
  templateUrl: './ng-group-members.component.html',
    styles:[`.taxActive {background-color: #D9EDF7 !important;}
			.taxTableRow {cursor:pointer;}
			.taxUnresolvedPicker{
		font-style:italic;
		color: #a94442;
	}
	
	.taxResolvedPicker{	
		text-decoration:underline;
	}
	
	.mat-option{
		line-height:inherit;
		border-bottom-color:#DDD;
		border-bottom-style:solid;
		border-bottom-width:1px;
	}
	
	.taxPeoplePickerContainer{
		display:inline-block
		width:100%;
	}
	
	.taxPeoplePickerResults{
		width:100%;
	}
	
	.taxPeoplePickerText{
			line-height:normal;
			padding-top:0px;
			padding-bottom:0px;
			height:25px;
	}
	.taxMainResultPicker{
		font-size:14px;
		font-family: "Segoe UI Regular WestEuropean","Segoe UI",Tahoma,Arial,sans-serif;
		font-weight:400;
		color:#333;
		padding-top:4px;
	}
	.taxSecResultPicker{
		font-size:12px;
		color:#666;
		font-family: "Segoe UI Regular WestEuropean","Segoe UI",Tahoma,Arial,sans-serif;
		font-weight:400;
		margin-top:2px;	
	}
	
	input.ng-invalid  {
			border-left: 5px solid #a94442; /* red */
		}
		
	.mattooltiptax{
		font-size:14px;
		font-family: "Segoe UI Regular WestEuropean","Segoe UI",Tahoma,Arial,sans-serif;
		font-weight:600;
		color:#eee;
		padding-top:4px;
	}
	input[type=text]::-ms-clear {
		display: none;
	}


	
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
	
	//begin of picker related props
	//access to the input that triggers the autocomplete.
	@ViewChild('term', { read: MatAutocompleteTrigger }) 
	autoCompleteInput: MatAutocompleteTrigger;
	items: Observable<UserInfoListEntry[]>;
	currentItems : UserInfoListEntry[] = [];
	private searchTermStream = new Subject<string>();
	//empTitle:string = "";
	isResolved:boolean = false;
	entryNotValid:boolean= false;
	selectedEmp: UserInfoListEntry = null;
	numberOfActiveRequests:number=0;
	userHitEnter:boolean = false;
	flag=false;
	pickerTooltip = "Please start typing a name";
	hideNoResultsFound = true;  /// this needs be changed for errorAdding.
	//end o picker related props.
	
	
	
	///pickerrelated methods begin
	private cleanPicker(){
		this.pickerTooltip = "Please start typing a name";
		this.isResolved = false;
		this.userHitEnter = false;
		this.currentItems = [];
		this.numberOfActiveRequests = 0;
		this.selectedEmp = null;
		this.entryNotValid = false;
	}
	
	private resolvePicker(employee: UserInfoListEntry){
		this.pickerTooltip = employee['email'] +' - ' +employee['name'];
		this.isResolved =  true;
		this.selectedEmp = employee;
		this.entryNotValid = false;
		//this.group.get('insideTextbox').patchValue(employee.ID, {emitEvent:false}); not needed? 
	}
	
	private toTitleCase(term: string) {
		return term.replace(/\w\S*/g, (term) => { return term.charAt(0).toUpperCase() + term.substr(1).toLowerCase(); });
	}
	
	detectKeyDown(event:KeyboardEvent){
	//if(this.isResolved&& this.selectedEmp && this.empTitle == this.selectedEmp.title){
		//if(event && event.keyCode ==8&& this.selectedEmp && this.empTitle == this.selectedEmp.title){
		//if(event && event.keyCode ==8&& this.isResolved){
		
		let safeKeys :number[]= [9,13,35,36,37,38,39,40] ;
		if(event && (this.isResolved || this.entryNotValid)&& safeKeys.filter(x=> x==event.keyCode).length==0){
			//so that i can put here an if isresolved then cleanup the picker.
			this.cleanPicker();
			this.emailsToAdd = '';
			this.flag = true;	// question this line of code? ? ?? ??
			// cleaning the search results.
			this.search("", null);
		}
	}
	
	///Sets employee via the autocomplete.
	/// Either by hitting enter (keyboard) or by clicking on an option.
	setEmployee(emp: UserInfoListEntry, event:any) {
		//this.selectedEmp = emp;
		//commenting the below line for reactive form.
		//this.empTitle= '';
		this.search("", null);
		this.resolvePicker(emp);
		//this.isResolved = true;
	}
	
	
	blurEvent(term:string){
		if(!this.isResolved &&this.emailsToAdd){
			this.userHitEnter= true;
			//we are tricking the distinctUntilChanged with the addition of a space.
			//need better code.
			this.search(term+" ",  null);
		}
	}
	
	search(term: string, event:KeyboardEvent) {	
		if(this.entryNotValid ||(event && event.keyCode > 34 && event.keyCode<41)){
			//disregard arrow keys: 37, 38, 39, 40.
			//disregard end and home: 35, 36.
			return ; 
		}
	
		if(this.flag){
			//prevent coming twice to the same method.
			this.flag = false;
			return;
		}
		if(this.userHitEnter && this.currentItems){
			let filteredResults:UserInfoListEntry[];
			filteredResults = this.currentItems.filter(x =>{ 
			var y = <any> x;
			var z = this.emailsToAdd.toUpperCase().trim();
			return y.title.toUpperCase() ==z || y.email.toUpperCase() == z
			|| y.name.toUpperCase() == z || y.name.toUpperCase() == ("ID\\"+z)
			});
			if(filteredResults && filteredResults.length ==1){
				//this.resolvePicker(filteredResults[0]);
				this.userHitEnter = false;
				this.flag = true;
				this.emailsToAdd = filteredResults[0].title;
				this.resolvePicker(filteredResults[0]);
				this.autoCompleteInput.closePanel();
				this.searchTermStream.next("");			
				return;
			}
		}
		this.hideNoResultsFound = true;//it was on the on key down at the beginning.
		this.searchTermStream.next(this.toTitleCase(term));
	}
	
	 constructor() { 
	 this.items = <Observable<UserInfoListEntry[]>>this.searchTermStream
		  .debounceTime(300)
		  .distinctUntilChanged()
		  .switchMap((term: string) => {
			this.numberOfActiveRequests+=1;
			return this.businessClass.searchForPeople(term).then(x=>{
				if(x){
					if(this.hideNoResultsFound&& term.length > 1){
						this.hideNoResultsFound = false;
					}
					let tempResults:UserInfoListEntry[]=<UserInfoListEntry[]> x;
					let filteredResults:UserInfoListEntry[];
					this.currentItems = tempResults;
					if(this.userHitEnter){
						filteredResults = tempResults.filter(x => {
							var y = <any> x;
							var z = this.emailsToAdd.toUpperCase().trim();
							return y.title.toUpperCase() ==z || y.email.toUpperCase() == z
							|| y.name.toUpperCase() == z || y.name.toUpperCase() == ("ID\\"+z)
						});
						this.userHitEnter = false;
						if(filteredResults && filteredResults.length ==1){
							//this.resolvePicker(filteredResults[0]);
							this.autoCompleteInput.closePanel();
							this.emailsToAdd = filteredResults[0].title;
							this.resolvePicker(filteredResults[0]);
							tempResults = [];
						}else if(!this.isResolved){
							this.entryNotValid = true;
						}
					}
					this.numberOfActiveRequests-=1;
					
					return tempResults;
				}
				else if(this.userHitEnter&& !this.isResolved){
					this.entryNotValid = true;
				}
				this.numberOfActiveRequests-=1;
				
				return x;
				});
		  });
	 }
	
	///picker related methods end.
	
	
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
	
	processingAdding = false;
	processingDeleting = false;
	successMessage:string;
	errorAdding:string;
	emailsToAdd:string;
	emailsToErase:string[]=[];
	errorRemoving:string;

  ngOnInit() {
	  
  }
  
  add(){
		
		this.clearErrors();				
		if(this.group.Workers.filter((worker)=>
			 worker.getEmail().toLowerCase().trim() == (<string>this.selectedEmp["email"]).toLowerCase().trim()
			).length==0){
			this.processingAdding = true;
			this.businessClass.addEmails(this.groups, this.group, [this.selectedEmp["email"]])
				.then((resultArray)=>{
					this.successMessage =resultArray.filter((result)=>
					//only count the ones that have no error and belong to the current referral type.
					(!result[1])&&(<WorkerEntry> result[0])[WorkerEntry.filterColumn]==this.group["Title"]
					).length+" emails were added!!";
					if(resultArray.filter((x)=>x[1]).length >0){
						//check for errors:
						this.errorAdding = "Error(s) occurred while adding: ";
						for(let result of resultArray){
							if(result[1]){
								this.errorAdding+="\n - "+result[1];
							}
						}
					}
					this.cleanPicker();
					this.emailsToAdd = '';
					this.flag = true;	// question this line of code? ? ?? ??
					// cleaning the search results.
					this.search("", null);
					this.processingAdding = false;
				})
				.catch((error:any)=> {
					this.errorAdding = "An error occurred while adding: "+(error.message || error);
					this.processingAdding = false;
				});
		}
		else{
			this.errorAdding='The specified person already exist in this group';
		}		
  }
  
  removeSelected(){
	  this.clearErrors();
	  
	  this.processingDeleting = true;
	  this.businessClass.removeEmails(this.groups, this.group,this.emailsToErase ).then((result) =>{
		if(result && result.length == 0 )
			this.successMessage = "Successfully removed the following emails: "+ this.emailsToErase.join(", ");
		else
		if(result)
			this.errorRemoving = "Error: "+ result.join(', ');
		else
			this.errorRemoving = "Error Removing the selected people."
		
		this.emailsToErase = [];
		this.processingDeleting = false;
	  }).catch((error:any)=>{
	  this.errorRemoving = "An error Ocurred while Removing: "+ (error.message || error);
	  this.processingDeleting = false;
	  
	  });
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
