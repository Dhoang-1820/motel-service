/** @format */

export class AppConstant {
    public static readonly ROLE_ADMIN: string = 'ROLE_ADMIN'
    public static readonly ROLE_LANDLORD: string = 'ROLE_LANDLORD'
    public static readonly ROLE_TENANT: string = 'ROLE_TENANT'
    public static readonly ROLE_MODERATOR: string = 'ROLE_MODERATOR'

    public static readonly UNITS: String[] = ['Phòng', 'Tháng', 'Số (kWh)', 'Khối (m3)', 'Chiếc', 'Cái', 'Giờ']
    public static readonly EQUIPMENT_STATUS: String[] = ['Mới', 'Cũ', 'Hỏng']

    public static readonly ELECTRIC_PRICE_NAME: String = 'Tiền điện'
    public static readonly WATER_PRICE_NAME: String = 'Tiền nước'

    public static readonly QUICK_PRICE: { name: string; value: { from: number; to: number } }[] = [
        { name: 'Dưới 1 triệu đồng', value: { from: 0, to: 1 } },
        { name: 'Từ 1 - 2 triệu đồng', value: { from: 1, to: 2 } },
        { name: 'Từ 2 - 3 triệu đồng', value: { from: 2, to: 3 } },
        { name: 'Từ 3 - 5 triệu đồng', value: { from: 3, to: 5 } },
        { name: 'Từ 5 - 7 triệu đồng', value: { from: 5, to: 7 } },
        { name: 'Từ 7 - 10 triệu đồng', value: { from: 7, to: 10 } }
    ]

    public static readonly QUICK_AREAGE: { name: string; value: { from: number; to: number } }[] = [
        { name: 'Dưới 20m²', value: { from: 0, to: 20 } },
        { name: 'Từ 20m² - 30m²', value: { from: 20, to: 30 } },
        { name: 'Từ 30m² - 50m²', value: { from: 30, to: 50 } },
        { name: 'Từ 40m² - 50m²', value: { from: 40, to: 50 } },
        { name: 'Từ 50m² - 60m²', value: { from: 50, to: 60 } },
    ]

    public static readonly GENDER: { key: string; value: string }[] = [
        { key: 'MALE', value: 'Nam' },
        { key: 'FEMALE', value: 'Nữ' },
        { key: 'UNKNOWN', value: 'Chưa biết' },
    ]
}
