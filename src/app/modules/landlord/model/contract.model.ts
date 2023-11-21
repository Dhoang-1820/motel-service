import { User } from "../../model/user.model"
import { RoomDropdown, Services } from "./accomodation.model"
import { Tenant } from "./tenant.model"

export class Contract {
    id?: Number
    lanlord?: Tenant
    duration?: Number
    deposit?: number
    startDate?: Date
    endDate?: Date
    firstElectricNum?: Number
    firstWaterNum?: Number
    isActive?: Boolean
    representative?: Tenant
    tenants?: Tenant[] = []
    services?: Services[] = []
    room?: RoomDropdown = {}
    preRoom?: Number
    dayStayedBefore?: number
    firstComePayment?: number
    keepRoomDeposit?: number
}