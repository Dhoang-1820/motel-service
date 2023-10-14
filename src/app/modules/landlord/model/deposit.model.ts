import { RoomDropdown } from "./accomodation.model"


export class Deposit {
    id?: Number
    room?: RoomDropdown
    dueDate?: Date
    startDate?: Date
    note?: String
    deposit?: Number
    tenantId?: Number
    isActive?: Boolean
    isRepaid?: Boolean
    firstName?: String
    lastName?: String
    phone?: String
    identifyNum?: String
    email?: String
    accomodationId?: Number
}

export class CancelDepositRequest {
    depositId?: Number
    isRepaid?: Boolean
}