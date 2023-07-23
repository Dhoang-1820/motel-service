interface InventoryStatus {
    label: string;
    value: string;
}
export interface Accomodation {
    id?: string;
    name?: string;
    waterPrice?: number;
    electricPrice?: number;
    address?: string;
}
export interface OtherFee {
    id?: string;
    name?: string;
    price?: string;
}
export interface Room {
    id?: number,
    name?: string,
    acreage?: number,
    airConditionor?: boolean,
    internet?: boolean,
    isRent?: boolean,
    maxCapacity?: number,
    price?: number
}