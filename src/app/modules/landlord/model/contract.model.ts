import { RoomDropdown, Services } from "./accomodation.model"
import { Tenant } from "./tenant.model"

export class Contract {
    id?: Number
    duration?: Number
    recurrent?: Number
    deposit?: Number
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
}