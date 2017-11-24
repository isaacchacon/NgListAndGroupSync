import {SharepointListsWebService} from 'ng-tax-share-point-web-services-module';
import {GroupEntry} from './group-entry';
import {WorkerEntry} from './worker-entry';
import {SharepointListItem} from 'ng-tax-share-point-web-services-module';

export class ListAndGroupManagement{

	constructor(private sharepointListsWebService:SharepointListsWebService){
		
	}
	
	loadListsAndGroups():Promise<GroupEntry[]>{
		let resultfromConfigList  =this.sharepointListsWebService.getListItems(GroupEntry, null, "<Query><OrderBy><FieldRef Name ='Title'/></OrderBy></Query>", null )
		.then(
			function(groupEntrys){
				// a little bit of preparation before we invoke the next web service. 
				// need to setup the static parameters for this WorkerEntry Object
				let entries:GroupEntry[];
				if(groupEntrys && groupEntrys.length >0){
					entries=<GroupEntry[]> groupEntrys;
					WorkerEntry.siteUrl = entries[0].getSiteUrl();
					WorkerEntry.listName = entries[0]["WorkerListName"]
					WorkerEntry.filterColumn = entries[0]["FilterColumn"];
					WorkerEntry.emailColumn = entries[0]["EmailColumn"];
				}
				else  return Promise.reject("Error ListAndGroupManagement1")
				return Promise.resolve(entries);
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
		
		//return <Promise<GroupEntry[]>>resultfromConfigList;
		
	}
}