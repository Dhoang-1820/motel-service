import { RoomDropdown, Services } from "./accomodation.model";

export class Post {
    id?: number;
	title?: string;
	content?: string;
	isActive?: boolean;
	createdAt?: Date;
	lastChange?: Date;
	userId?: number;
	room?: RoomDropdown[];
	services?: Services[];
    images?: any[] = []
}