export class AppConstant {
    public static readonly ROLE_ADMIN: string = 'ROLE_ADMIN'
    public static readonly ROLE_LANDLORD: string = 'ROLE_LANDLORD'
    public static readonly ROLE_TENANT: string = 'ROLE_TENANT'
    public static readonly ROLE_MODERATOR: string = 'ROLE_MODERATOR'

    public static readonly UNITS: String[] = ["Phòng", "Tháng", "Số (kWh)", "Khối (m3)", "Chiếc", "Cái", "Giờ"]
    public static readonly EQUIPMENT_STATUS: String[] = ["Mới", "Cũ", "Hỏng"]

    public static readonly ELECTRIC_PRICE_NAME: String = 'Tiền điện'
    public static readonly WATER_PRICE_NAME: String = 'Tiền nước'

    public static readonly GENDER: {key: string, value: string}[] = [{key: 'MALE', value: 'Nam'}, {key: 'FEMALE', value: 'Nữ'}, {key: 'UNKNOWN', value: 'Chưa biết'}]
}
