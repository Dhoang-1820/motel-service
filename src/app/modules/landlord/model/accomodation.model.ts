export interface OtherFee {
    accomodationId?: number;
    id?: number;
    name?: string;
    unit?: string;
    price?: string;
}

export interface Room {
    id?: Number,
    name?: string,
    acreage?: number,
    isRent?: boolean,
    capacity?: number,
    price?: number,
    accomodationId?: number
}

export interface RoomDropdown {
    id?: Number
    name?: string
    price?: Number
}

export interface Accomodation {
    id?: number;
    name?: string;
    addressLine?: string;
    userId?: number;
    isActive?: boolean;
    district?: string;
    districtCode?: number;
    province?: string;
    provinceCode?: number
    ward?: string;
    wardCode?: number;
    services?: AccomodationUtilities[]
}

export interface AccomodationUtilities {
    accomodationId?: number,
    id?: number;
    name?: String;
    price?: Number;
    unit?: string;
    description?: string;
    isDefault?: boolean
    quantity?: Number
}

export interface Services {
    unit?: String
    price?: Number
    name?: String
    quantity?: Number
}