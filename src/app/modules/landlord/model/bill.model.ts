import { RoomDropdown } from './accomodation.model'

export class Invoice {
    id?: number
    room?: RoomDropdown
    isSent?: boolean
    totalPayment?: number
    billDate?: Date
    totalPrice?: number
    isPay?: boolean
    createdAt?: Date
    representative?: string
    paidMoney?: number
    debt?: number
    totalService?: number
    discount?: number
    paymentDate?: number
    newDebt?: number
    service?: InvoiceServiceDto[]
    loading?: boolean
    description?: string
}

export class InvoiceServiceDto {
    serviceName?: string
    unit?: string
    price?: number
    quantity?: number
    firstElectricNum?: number
    lastElectricNum?: number
    firstWaterNum?: number
    lastWaterNum?: number
    electricNum?: number
    waterNum?: number
    totalPrice?: number
}
