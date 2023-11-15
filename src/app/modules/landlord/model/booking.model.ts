import { RoomDropdown } from "./accomodation.model";

export class Booking {
    id?: number;
	accomodation?: string;
    accomodationId?: number;
	name?: string;
	email?: string;
	phone?: string;
	reviewDate?: Date;
	createdDate?: Date;
	roomId?: number;
	room?: RoomDropdown;
}