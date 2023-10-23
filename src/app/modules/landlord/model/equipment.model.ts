import { Room } from "./accomodation.model"

export class Equipment {
    id?: Number
    name?: String
    unit?: String
    description?: String
    status?: String
    price?: Number
    roomId?: Number[]
    accomodationId?: Number
    isAddRoom?: Boolean
    selectedRoom?: Room[]
    quantity?: Number
    room?: any
}
