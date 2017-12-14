import {SharepointListItem} from 'ng-tax-share-point-web-services-module';
import {WorkerEntry} from './worker-entry';
import {ListItemInterface} from './list-item-interface';
import {TaxSpUser} from 'ng-tax-share-point-web-services-module';

export class GroupEntry extends SharepointListItem implements ListItemInterface{
	
	constructor(rawResponse?:any){
		super(rawResponse);	
	}
	
	getItemProperties():string[]{
		return["SpGrpName","Title","WorkerListName","FilterColumn","EmailColumn", "OwnerGroupLink", "OwnerGroupName"];
	}

	Workers:WorkerEntry[];
	Owners:TaxSpUser[];
	
	//This property must be set before consuming this object.
	static relativeWebUrl:string;
	
	getSiteUrl():string{
		return GroupEntry.relativeWebUrl;
	}
	getListName():string{
		return 'ListAndGroupSyncConfig';
	}
	getFieldToUpdate():string{
		return 'Not IMplemented';
	}
}
