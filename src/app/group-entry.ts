import {SharepointListItem} from 'ng-tax-share-point-web-services-module';
import {WorkerEntry} from './worker-entry';

export class GroupEntry extends SharepointListItem {
	
	constructor(rawResponse?:any){
		super(rawResponse);	
	}
	
	getItemProperties():string[]{
		return["SpGrpName","Title","WorkerListName","FilterColumn","EmailColumn"];
	}

	Workers:WorkerEntry[];
	
	getSiteUrl():string{
		return '/forms/PITRef/';
	}
	getListName():string{
		return 'ListAndGroupSyncConfig';
	}
	getFieldToUpdate():string{
		return 'Not IMplemented';
	}
}
