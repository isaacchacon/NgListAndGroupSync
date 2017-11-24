import {SharepointListItem} from 'ng-tax-share-point-web-services-module';

export class WorkerEntry extends SharepointListItem {
	
	constructor(rawResonse?:any){
		super(rawResonse);
	}
	
	//the below ones need to be set first before making 
	// this class usable, these properties need to be fed
	// by the configuration list, 'ListAndGroupSyncConfig'
	static siteUrl="Unset";
	static listName="Unset";
	static filterColumn= "Unset";
	static emailColumn= "Unset";
	
	getItemProperties():string[]{
		return[WorkerEntry.filterColumn, WorkerEntry.emailColumn];
	}
	
	getEmail():string{
		return this[WorkerEntry.emailColumn];
	}
	
	getSiteUrl():string{
		return WorkerEntry.siteUrl;
	}
	getListName():string{
		return WorkerEntry.listName;
	}
	getFieldToUpdate():string{
		return 'Not IMplemented';
	}

}