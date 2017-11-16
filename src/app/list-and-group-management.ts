import {SharepointListsWebService} from 'ng-tax-share-point-web-services-module';
import {GroupEntry} from './group-entry';

export class ListAndGroupManagement{

	constructor(private sharepointListsWebService:SharepointListsWebService){
		
	}
	
	loadListsAndGroups():Promise<GroupEntry[]>{
		return this.sharepointListsWebService.getListItems(GroupEntry, null, "<Query><OrderBy><FieldRef Name ='Title'/></OrderBy></Query>", null )
		.then(
			function(groupEntrys){
				let entries:GroupEntry[] =<GroupEntry[]> groupEntrys;
				for(let entry of entries){
					switch (entry.ID){
							case 1:
							entry.Workers= [{ID:1,Email:"jorge.gutierrez@tax.state.oh.us"},{ID:2, Email:"brent.wallace@tax.state.oh.us"} ];
							break;
							case 2:
							entry.Workers= [{ID:1,Email:"frank.tolbard@tax.state.oh.us"} ];
							break;
							case 3: 
							entry.Workers = [{ID:1,Email:"jorge.gutierrez@tax.state.oh.us"},{ID:2, Email:"brent.wallace@tax.state.oh.us"},{ID:3,Email: "jack.lewis@tax.state.oh.us"},
				{ID:4,Email: "mahendra.daga@tax.state.oh.us"},{ID:5, Email:"stacy.ours@tax.state.oh.us"}];
							break;
							case 4:
							default:
							entry.Workers = [{ID:1,Email:"mark.walker@tax.state.oh.us"}, {ID:2,Email:"jorge.gutierrez@tax.state.oh.us"} ];
							break;							
					}					
				}
				return entries;
			}
		);
	}
}