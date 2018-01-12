import {SharepointListsWebService} from 'ng-tax-share-point-web-services-module';
import {SharepointUserGroupWebService} from 'ng-tax-share-point-web-services-module';
import {UrlService} from 'ng-tax-share-point-web-services-module';
import {UserInfoListEntry} from 'ng-tax-share-point-web-services-module';
import {GroupEntry} from './group-entry';
import {WorkerEntry} from './worker-entry';
import {SharepointListItem} from 'ng-tax-share-point-web-services-module';
import {TaxSpUser} from 'ng-tax-share-point-web-services-module';

export class ListAndGroupManagement{

	constructor(private sharepointListsWebService:SharepointListsWebService, 
				private sharepointUserGroupWebService:SharepointUserGroupWebService,
				private urlService:UrlService){
		
	}
	
	//Will search for an item that contains the provided term in either the display name ,the 
	// email or the Account Number. It is case insensitive search!!! What else could you ask for!! ? ?
	searchForPeople(term:string): Promise<SharepointListItem[]>{
		if(term){
			let trimmedTerm = term.trim();
			if(trimmedTerm.length>1){			
				if(trimmedTerm){
					return this.sharepointListsWebService.getListItems(UserInfoListEntry, null ,
						"<Query><OrderBy><FieldRef Name ='Title'/></OrderBy><Where><And><Eq><FieldRef Name='ContentType' />"+
						"<Value Type='Text'>Person</Value></Eq><Or><Or><Contains><FieldRef Name='EMail' /><Value Type='Text'>"+
						trimmedTerm+"</Value></Contains><Contains><FieldRef Name='Title' /><Value Type='Text'>"+
						trimmedTerm+"</Value></Contains></Or><Contains><FieldRef Name='Name' /><Value Type='Text'>"+
						trimmedTerm+"</Value></Contains></Or></And></Where></Query>", null);
				}
			}
		}
		
		//if any of the condition were false, return empty array.
		return Promise.resolve([]);
	}
	
	
	//Method to load the configuration list and joins it with the workers list. 
	//This is the load method.(first method) to be called.
	loadListsAndGroups():Promise<GroupEntry[]>{
		//before we begin we need to set the current url. This is set and forget.
		GroupEntry.relativeWebUrl= this.urlService.getCurrentSiteUrl();
		let resultfromConfigList  =this.sharepointListsWebService.getListItems(GroupEntry, null, "<Query><OrderBy><FieldRef Name ='Title'/></OrderBy></Query>", null )
		.then(
			(groupEntries)=>{
				// a little bit of preparation before we invoke the next web service. 
				// need to setup the static parameters for this WorkerEntry Object
				let entries:GroupEntry[];
				if(groupEntries && groupEntries.length >0){
					entries=<GroupEntry[]> groupEntries;
					WorkerEntry.siteUrl = entries[0].getSiteUrl();
					WorkerEntry.listName = entries[0]["WorkerListName"]
					WorkerEntry.filterColumn = entries[0]["FilterColumn"];
					WorkerEntry.emailColumn = entries[0]["EmailColumn"];
					
					let ownerGroupCalls: Promise<TaxSpUser[]>[] = [];
					for(let groupEntry of entries){
						ownerGroupCalls.push(this.sharepointUserGroupWebService.getUserCollectionFromGroup(groupEntry["OwnerGroupName"], WorkerEntry.siteUrl));
					}
					return Promise.all(ownerGroupCalls).then((ownerGroups)=>{
							let i = 0 ;
							for(let ownerGroupResult of ownerGroups){
								entries[i].Owners = <TaxSpUser[]> ownerGroupResult;
								entries[i].Owners.sort((a:TaxSpUser, b:TaxSpUser) => a.email.toLowerCase().localeCompare(b.email.toLowerCase()));
								i++;
							}
							return entries;
					})
				}
				else  return Promise.reject("Error loadListsAndGroups1 in ListAndGroupManagement")
			}
		);
		
		let resultFromWorkersList  = resultfromConfigList.then(()=>  this.sharepointListsWebService.getListItems(WorkerEntry, null, "<Query><OrderBy><FieldRef Name ='"+WorkerEntry.emailColumn+"'/></OrderBy></Query>", null ));
		
		let bundledPromises = [resultfromConfigList, resultFromWorkersList];
		
		return Promise.all(bundledPromises).then(
			function(bothPromises){
				//once we have the 2 result sets, we match them and merge them in a single object.
				if(bothPromises&& bothPromises.length && bothPromises.length==2){
					let groupEntries:GroupEntry[] = <GroupEntry[]> bothPromises[0];
					let workerEntries: WorkerEntry[] = <WorkerEntry[]>bothPromises[1];
					for(let groupEntry of groupEntries){
						groupEntry.Workers = workerEntries.filter(
						function(worker:WorkerEntry){
							return worker[WorkerEntry.filterColumn]== groupEntry["Title"];
						});
					}
					return Promise.resolve(groupEntries);
				}
				else return Promise.reject("Error ListAndGroupManagement2")
			}
		);		
	}
	sortOwnersInsensitive(a:TaxSpUser, b:TaxSpUser) {
		return a.email.toLowerCase().localeCompare(b.email.toLowerCase());
	}
	
	
	
	sortInsensitive(a:string, b:string) {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	}
	
	//HelperMethod that builds an array from a string with semicolon separated emails.
	stringToArray(stringOfEmails:string):string[]{
		let tempArray:string[]=[];
		let tempArray2:string[];
		let tempArray3:string[];
		if(stringOfEmails){
			stringOfEmails = stringOfEmails.trim();
			if(stringOfEmails.length>0){
				tempArray3 = stringOfEmails.split(';');
				tempArray3.sort(this.sortInsensitive);
				tempArray3.forEach(function(item:string, index:number){
					item = item.replace(/(\r\n|\n|\r)/gm,"").trim();
					if(item.indexOf(",")>=0){
						tempArray2 = item.split(',');
						tempArray2.forEach(function(item2:string, index2:number){
							item2= item2.replace(/(\r\n|\n|\r)/gm,"").trim();
						});
						tempArray=tempArray.concat(tempArray2);
					}
					else
					{
						tempArray.push(item);
					}
				});
				tempArray.sort(this.sortInsensitive);
				tempArray = tempArray.filter(a=> a.length>0);
			}
		}
		return tempArray;
	}
	
	
	//Helper method to find other referral types different than the one 
	//tries to find other referral types (or group objects) that are tied to the same sharepoint group
	//(group['SpGrpName']) other than the self group.
	private findOtherReferralTypes(groups:GroupEntry [], group:GroupEntry): GroupEntry[]{
		return groups.filter((groupBeingFiltered)=>{
			// second part of the condition make sure it's not the same group.
			let selectedGroup = (<string>group['SpGrpName']).toLowerCase().trim();
			return (<string>groupBeingFiltered['SpGrpName']).toLowerCase().trim()==selectedGroup &&
			(<string>groupBeingFiltered["Title"]) !=(<string>group["Title"]);
		});
	}
	
	///Business method that will try to remove the specified emails.
	///IT first removes them from the list.
	/// It also removes from other referral types under the same sharepoint group.
	///Then it tries to remove the members from the group.
	///  For that second action, it looks up  the login id's, deending on:
	///  - if it's test, it'll look into the user information list.
	///  - if it's not test, it'll look into the getUserLoginFromEmail from the usergroup web service.
	removeEmails(groups:GroupEntry [], group:GroupEntry, emailsToErase:string[]):Promise<string[]>{

		let workersEntriesToErase:WorkerEntry[]= 
		group.Workers.filter((worker)=>emailsToErase.indexOf(worker.getEmail())>=0);
		
		//look for other referral types that are tied to the same SharePoint Group.
		let otherGroups:GroupEntry[] = this.findOtherReferralTypes(groups, group);
		
		
		//if other groups utilize the same SharePoint group,
		// then remove their associated emails.
		if (otherGroups&& otherGroups.length>0){
			let otherWorkers :WorkerEntry[] = [];
			let otherWorkersAux: WorkerEntry[];
			for(let otherGroup of otherGroups){
				otherWorkersAux = [];
				otherWorkersAux = otherGroup.Workers.filter((worker)=>{
					//Perform a case insensitive search:
					let workerEmail = worker.getEmail().toLowerCase().trim();
					let matches :string[] = emailsToErase.filter((emailToErase)=>
						emailToErase.toLowerCase().trim() == workerEmail
					);
					return matches.length > 0 ; 			
				});
				otherWorkers = otherWorkers.concat(otherWorkersAux);
			}
			workersEntriesToErase = workersEntriesToErase.concat(otherWorkers);
		}
		
		///next thing to do : CONSUME REMOVE LIST ITEM.	
		let removeListItemsPromise= this.sharepointListsWebService.removeListItems(workersEntriesToErase);
		
		///Now need to update the associated SharePoint Group...

		// if(isTest){
		// promiseOfSpTaxUser = this.getLoginsFromUserProfile(emailsToErase);
		// }else{
		let intPromise = this.sharepointUserGroupWebService.getUserLoginFromEmail(emailsToErase,workersEntriesToErase[0].getSiteUrl())
			.then((spTaxUsers)=>this.sharepointUserGroupWebService
			 .removeUserCollectionFromGroup(spTaxUsers,group["SpGrpName"],workersEntriesToErase[0].getSiteUrl()));

		return Promise.all([removeListItemsPromise,intPromise]).then((resultsOfBothPromises)=>{
			let resultFirstPromise :string[] = resultsOfBothPromises[0];
			//update business objects after success.
			if(resultFirstPromise && resultFirstPromise.length ==0){
				group.Workers = group.Workers.filter((worker)=>emailsToErase.indexOf(worker.getEmail())<0); 
				if(otherGroups && otherGroups.length>0){
					for(let otherGroup of otherGroups){
						otherGroup.Workers = otherGroup.Workers.filter((worker)=>{
							let workerEmail = worker.getEmail().toLowerCase().trim();
							let matches :string[] = emailsToErase.filter((emailToErase)=>
								emailToErase.toLowerCase().trim() == workerEmail
							);
							return matches.length == 0 ; 			
						});
					}
				}
			}
			return resultFirstPromise;
		}).catch((error)=>Promise.reject("Error At RemoveEmails:"+(error.message || error)));	
	}


	///Business method that will try to add the specified emails.
	///IT first adds them from the list Item.
	///It also adds to other referral types under the same sharepoint group.
	///Then it tries to add the members to the SharePoint group.
	///  For that second action, it looks up  the login id's, depending on:
	///  - if it's test, it'll look into the user information list.
	///  - if it's not test, it'll look into the getUserLoginFromEmail from the usergroup web service.
	addEmails(groups:GroupEntry[], group:GroupEntry, emailsToAdd:string[]):Promise<[SharepointListItem,string][]>{
		let workersToAdd:WorkerEntry[] = [];
		for(let email of emailsToAdd){
			workersToAdd.push(new WorkerEntry(WorkerEntry.buildRawResponseArray(0,
			[[WorkerEntry.emailColumn, email],
			 [WorkerEntry.filterColumn, group["Title"]]])));
		}
		
		//look for other referral types that are tied to the same SharePoint Group.
		let otherGroups:GroupEntry[] = this.findOtherReferralTypes(groups, group);
		
		//if other groups utilize the same SharePoint group,
		// then check if they are already there. If not, then add them to the workersToadd array.
		if (otherGroups&& otherGroups.length>0){
			let emailsToAddForAnotherType :string[];
			//find which emails need to be added, in case that they don't belong to the current 'otherGroup'
			for(let otherGroup of otherGroups){
				emailsToAddForAnotherType = emailsToAdd.filter((emailToAdd)=>{
					//we should add the emails that are not found among all the otherGroup's workers.
					let trimmedEmailToAdd = emailToAdd.toLowerCase().trim();
					let matches = otherGroup.Workers.filter((worker)=>
						worker.getEmail().toLowerCase().trim() == trimmedEmailToAdd);
					return matches.length == 0
				});
				
				for(let emailToAddForAnotherType of  emailsToAddForAnotherType){
					workersToAdd.push(new WorkerEntry(WorkerEntry.buildRawResponseArray(0,
						[[WorkerEntry.emailColumn, emailToAddForAnotherType],
						[WorkerEntry.filterColumn, otherGroup["Title"]]])));
				}
			}
		}
		
		///1stly, add the items into the list through the webservice: 
		let promiseOfAddedListItems =  this.sharepointListsWebService.addOrUpdateListItems(workersToAdd);
		
		//after taking care of the lists.asmx, then we'll worry about SharePoint group.
			// if(isTest){
				// promiseOfSpTaxUser = this.getLoginsFromUserProfile(emailsToAdd);
			// }else{
				
		let promiseOfSpTaxUser = this.sharepointUserGroupWebService.getUserLoginFromEmail(emailsToAdd,group.getSiteUrl())
		.then((spTaxUsers)=>this.sharepointUserGroupWebService.addUserCollectionToGroup(spTaxUsers,group["SpGrpName"],group.getSiteUrl()));
		// }
		
		//the below promise will return the first call's results. If there is an exception, the catch will show error on either of promises.
		return Promise.all([promiseOfAddedListItems,promiseOfSpTaxUser]).then((resultBothPromises)=> {
		let resultFirstPromise :[SharepointListItem,string][] = resultBothPromises[0]
		if(resultFirstPromise && resultFirstPromise.length >0){
				for(let result of resultFirstPromise){
					if(result[1]){
						//if the error string has something, don't add this item.
						continue;
					}
					let workerEntry = <WorkerEntry>result[0];
					if(workerEntry[WorkerEntry.filterColumn]== group["Title"]){
						group.Workers.push (workerEntry);
					}
					else if(otherGroups && otherGroups.length >0){
						for(let otherGroup of otherGroups){
							if(otherGroup["Title"]==workerEntry[WorkerEntry.filterColumn]){
								otherGroup.Workers.push(workerEntry);
							}
						}
					}					
				}
				//sort the Workers.
				group.Workers = group.Workers.sort(this.sortCriteriaForWorkers);
				if(otherGroups && otherGroups.length > 0){
					for(let otherGroup of otherGroups){
						otherGroup.Workers.sort(this.sortCriteriaForWorkers);
					}
				}
			}
			return resultFirstPromise;
		});	
	}
	
	sortCriteriaForWorkers(a:WorkerEntry, b:WorkerEntry):number{
		return a.getEmail().toLowerCase().trim().localeCompare(b.getEmail().toLowerCase().trim());
	}
		
}