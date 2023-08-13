

export interface OtherFee {
    accomodationId?: number;
    id?: number;
    name?: string;
    unit?: string;
    price?: string;
}
export interface Room {
    id?: number,
    name?: string,
    acreage?: number,
    airConditionor?: boolean,
    internet?: boolean,
    isRent?: boolean,
    capacity?: number,
    price?: number,
    accomodationId?: number
}

export interface Accomodation {
    id?: number;
    name?: string;
    waterPrice?: number;
    electricPrice?: number;
    address?: string;
    userId?: number;
    isActive?: boolean;
    otherFees?: OtherFee[];
}