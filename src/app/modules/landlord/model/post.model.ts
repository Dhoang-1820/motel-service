
export class Post {
    id?: number;
	title?: string;
	content?: string;
	isActive?: boolean;
	createdAt?: Date;
	acreage?: number;
    capacity?: number;
    emptyRoomNum?: number = 1;
    price?: number;
	lastChange?: Date;
	userId?: number;
	addressLine?: string;
    district?: string;
    districtCode?: number;
    province?: string;
    provinceCode?: number
    ward?: string;
    wardCode?: number;
	status?: string;
    images?: any[] = []
}