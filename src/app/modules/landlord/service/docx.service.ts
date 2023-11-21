/** @format */

import { Injectable } from '@angular/core'
import {
    Alignment,
    AlignmentType,
    BorderStyle,
    Document,
    HeadingLevel,
    HeightRule,
    Paragraph,
    Table,
    TableCell,
    TableRow,
    TextDirection,
    TextRun,
    UnderlineType,
    VerticalAlign,
    WidthType,
} from 'docx'
import { Contract } from '../model/contract.model'

@Injectable({
    providedIn: 'root',
})
export class DocumentCreator {
    public createContract(contract: any): Document {
        let vnd = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        })
        const services = contract.services || []
        const document = new Document({
            styles: {
                paragraphStyles: [
                    {
                        id: 'content',
                        name: 'content',
                        run: {
                            font: 'Times New Roman',
                            size: 28,
                            color: '#000000',
                        },
                        paragraph: {
                            spacing: {
                                after: 300,
                                before: 300,
                                line: 450,
                            },
                        },
                    },
                    {
                        id: 'heading',
                        name: 'heading',
                        run: {
                            font: 'Times New Roman',
                            size: 30,
                            color: '#000000',
                        },
                    },
                ],
            },
            sections: [
                {
                    properties: {},
                    children: [
                        new Paragraph({
                            style: 'heading',
                            text: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM',
                            heading: HeadingLevel.HEADING_1,
                            alignment: AlignmentType.CENTER,
                        }),
                        new Paragraph({
                            style: 'heading',
                            text: 'Độc lập - Tự do - Hạnh phúc',
                            heading: HeadingLevel.HEADING_2,
                            alignment: AlignmentType.CENTER,
                        }),
                        new Paragraph({}),
                        new Paragraph({}),
                        new Paragraph({}),
                        new Paragraph({
                            style: 'heading',
                            text: 'HỢP ĐỒNG THUÊ PHÒNG TRỌ',
                            alignment: AlignmentType.CENTER,
                            heading: HeadingLevel.HEADING_2,
                        }),
                        new Paragraph({
                            alignment: AlignmentType.LEFT,
                            style: 'content',
                            children: [
                                new TextRun({
                                    text: `Hôm nay ngày .......... tháng .......... năm ..........`,
                                    break: 1,
                                }),
                                new TextRun({
                                    text: 'Chúng tôi gồm:',
                                    bold: true,
                                    break: 1,
                                }),
                                new TextRun({
                                    text: '1. Đại diện bên cho thuê phòng trọ (Bên A):',
                                    break: 1,
                                }),
                                new TextRun({
                                    text: `Ông/bà: ${contract.lanlord.fullname}`,
                                    break: 1,
                                }),
                                new TextRun({
                                    text: `CMND số: ${contract.lanlord.identifyNum}`,
                                    break: 1,
                                }),
                                new TextRun({
                                    text: `Số điện thoại: ${contract.lanlord.phone}`,
                                    break: 1,
                                }),

                                new TextRun({
                                    text: '2. Bên thuê phòng trọ (Bên B):',
                                    break: 1,
                                }),
                                new TextRun({
                                    text: `Ông/bà:  ${contract.representative.fullname}`,
                                    break: 1,
                                }),
                                new TextRun({
                                    text: `CMND số: ${contract.representative?.identifyNum}`,
                                    break: 1,
                                }),
                                new TextRun({
                                    text: `Số điện thoại: ${contract.representative?.phone}`,
                                    break: 1,
                                }),
                                new TextRun({
                                    text: 'Sau khi bàn bạc trên tinh thần dân chủ, hai bên cùng có lợi, cùng thống nhất như sau:',
                                    bold: true,
                                    break: 1,
                                }),
                                new TextRun({
                                    text: `Bên A đồng ý cho bên B thuê 01 phòng ở tại địa chỉ: ${contract.lanlord.address}`,
                                    break: 1,
                                }),
                                new TextRun({
                                    text: `Giá thuê: ${contract.room.price} /tháng`,
                                    break: 1,
                                }),
                                ...services
                                    .map((item: any) => {
                                        const arr: any[] = []
                                        arr.push(
                                            new TextRun({
                                                text: `${item.name}: ${vnd.format(item.price)} /${item.unit} với số lượng: ${item.quantity}`,
                                                break: 1,
                                            }),
                                        )
                                        return arr
                                    })
                                    .reduce((prev: string | any[], curr: any) => prev.concat(curr), []),

                                new TextRun({
                                    text: `Tiền đặt cọc: ${contract.deposit}`,
                                    break: 1,
                                }),
                                new TextRun({
                                    text: `Hợp đồng có giá trị kể từ ngày ${contract.startDate.day} tháng ${contract.startDate.month} năm ${contract.startDate.year} đến ngày ${contract.endDate.day} tháng ${contract.endDate.month} năm ${contract.endDate.year}`,
                                    break: 1,
                                }),
                            ],
                        }),
                        new Paragraph({
                            alignment: AlignmentType.LEFT,
                            style: 'content',
                            children: [
                                new TextRun({
                                    text: 'TRÁCH NHIỆM CỦA CÁC BÊN',
                                    bold: true,
                                    break: 2,
                                }),
                                new TextRun({
                                    text: '* Trách nhiệm của bên A:',
                                    bold: true,
                                    break: 1,
                                }),
                                new TextRun({
                                    text: '- Tạo mọi điều kiện thuận lợi để bên B thực hiện theo hợp đồng',
                                    break: 1,
                                }),
                                new TextRun({
                                    text: '- Cung cấp đầy đủ dịch vụ như đã liệt kê cho bên B sử dụng.',
                                    break: 1,
                                }),
                                new TextRun({
                                    text: '* Trách nhiệm của bên B:',
                                    bold: true,
                                    break: 1,
                                }),
                                new TextRun({
                                    text: '- Thanh toán đầy đủ các khoản tiền theo đúng thỏa thuận',
                                    break: 1,
                                }),
                                new TextRun({
                                    text: '- Bảo quản các trang thiết bị và cơ sở vật chất của bên A trang bị cho ban đầu (làm hỏng phải sửa, mất phải đền).',
                                    break: 1,
                                }),
                                new TextRun({
                                    text: '- Không được tự ý sửa chữa, cải tạo cơ sở vật chất khi chưa được sự đồng ý của bên A.',
                                    break: 1,
                                }),
                                new TextRun({
                                    text: '- Giữ gìn vệ sinh trong và ngoài khuôn viên của phòng trọ.',
                                    break: 1,
                                }),
                                new TextRun({
                                    text: '- Bên B phải chấp hành mọi quy định của pháp luật Nhà nước và quy định của địa phương.',
                                    break: 1,
                                }),
                                new TextRun({
                                    text: '- Nếu bên B cho khách ở qua đêm thì phải báo và được sự đồng ý của chủ nhà đồng thời phải chịu trách nhiệm về các hành vi vi phạm pháp luật của khách trong thời gian ở lại..',
                                    break: 1,
                                }),
                                new TextRun({
                                    text: 'TRÁCH NHIỆM CHUNG',
                                    bold: true,
                                    break: 1,
                                }),
                                new TextRun({
                                    text: '- Hai bên phải tạo điều kiện cho nhau thực hiện hợp đồng',
                                    break: 1,
                                }),
                                new TextRun({
                                    text: '- Trong thời gian hợp đồng còn hiệu lực nếu bên nào vi phạm các điều khoản đã thỏa thuận thì bên còn lại có quyền đơn phương chấm dứt hợp đồng; nếu sự vi phạm hợp đồng đó gây tổn thất cho bên bị vi phạm hợp đồng thì bên vi phạm hợp đồng phải bồi thường thiệt hại',
                                    break: 1,
                                }),
                                new TextRun({
                                    text: '- Một trong hai bên muốn chấm dứt hợp đồng trước thời hạn thì phải báo trước cho bên kia ít nhất 30 ngày và hai bên phải có sự thống nhất',
                                    break: 1,
                                }),
                                new TextRun({
                                    text: '- Bên A phải trả lại tiền đặt cọc cho bên B',
                                    break: 1,
                                }),
                                new TextRun({
                                    text: '- Bên nào vi phạm điều khoản chung thì phải chịu trách nhiệm trước pháp luật',
                                    break: 1,
                                }),
                                new TextRun({
                                    text: '- Hợp đồng được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ một bản',
                                    break: 1,
                                }),
                            ],
                        }),
                        new Paragraph({
                            alignment: AlignmentType.LEFT,
                            style: 'content',
                            children: [
                                new TextRun({
                                    text: 'BIÊN BẢN THANH TOÁN LẦN ĐẦU',
                                    bold: true,
                                    break: 2,
                                }),
                                new TextRun({
                                    text: `Số tiền đã đặt cọc: ${contract.deposit}`,
                                    break: 1,
                                }),
                                new TextRun({
                                    text: `+`,
                                    break: 1,
                                }),
                                new TextRun({
                                    text: `Số ngày đã ở: ${contract.dayStayedBefore} kể từ ngày ${contract.startDate.day}/${contract.startDate.month}/${contract.startDate.year} đến ngày ${contract.endDayStayedBefor})`,
                                    break: 1,
                                }),
                                new TextRun({
                                    text: `Thành tiền: ${contract.dayStayedMoney}`,
                                    break: 1,
                                }),
                                new TextRun({
                                    text: `-`,
                                    break: 1,
                                }),
                                new TextRun({
                                    text: `Tiền cọc giữ phòng (đồng): ${contract.holdRoomMoney}`,
                                    break: 1,
                                }),
                                new TextRun({
                                    text: `=`,
                                    break: 1,
                                }),
                                new TextRun({
                                    text: `Số tiền phải thanh toán: ${contract.firstTotalPayment}`,
                                    break: 1,
                                }),
                                new TextRun({
                                    text: `ĐẠI DIỆN BÊN B                                                           ĐẠI DIỆN BÊN A`,
                                    break: 1,
                                    bold: true,
                                }),
                            ],
                        }),
                    ],
                },
            ],
        })

        return document
    }

    public createInvoice(invoice: any): Document {
        const vnd = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        })
        const services: any[] = invoice.services
        const electricsWaterNum: any[] = invoice.electricsWaterNum
        const banks: any[] = invoice.banks
        const document = new Document({
            styles: {
                paragraphStyles: [
                    {
                        id: 'content',
                        name: 'content',
                        run: {
                            font: 'Times New Roman',
                            size: 24,
                            color: '#000000',
                        },
                        paragraph: {
                            spacing: {
                                after: 300,
                                before: 300,
                                line: 450,
                            },
                        },
                    },
                    {
                        id: 'table-content',
                        name: 'table-content',
                        run: {
                            font: 'Times New Roman',
                            size: 24,
                            color: '#000000',
                        },
                        paragraph: {
                            alignment: AlignmentType.CENTER, 
                        },
                    },
                    {
                        id: 'heading',
                        name: 'heading',
                        run: {
                            font: 'Times New Roman',
                            size: 28,
                            color: '#000000',
                        },
                    },
                ],
            },
            sections: [
                {
                    children: [
                        new Paragraph({
                            style: 'heading',
                            text: 'HOÁ ĐƠN TIỀN PHÒNG',
                            heading: HeadingLevel.HEADING_1,
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: `Tên phòng: ${invoice.roomName}`,
                                    bold: true,
                                    break: 2,
                                }),
                                new TextRun({
                                    text: `Thời gian: ${invoice.month}`,
                                    bold: true,
                                    break: 1,
                                }),
                            ],
                        }),
                        new Paragraph({}),
                        new Table({
                            width: {
                                size: '17cm',
                            },
                            alignment: AlignmentType.CENTER,
                            rows: [
                                new TableRow({
                                    height: { value: '0.8cm', rule: HeightRule.ATLEAST },
                                    children: [
                                        new TableCell({
                                            children: [
                                                new Paragraph({
                                                    style: 'table-content',
                                                    children: [
                                                        new TextRun({
                                                            text: 'Chi tiết các khoản chi',
                                                            bold: true
                                                        }),
                                                    ],
                                                    alignment: AlignmentType.CENTER,
                                                }),
                                            ],
                                            verticalAlign: VerticalAlign.CENTER,
                                        }),
                                        new TableCell({
                                            children: [
                                                new Paragraph({
                                                    style: 'table-content',
                                                    children: [
                                                        new TextRun({
                                                            text: 'Số lượng',
                                                            bold: true
                                                        }),
                                                    ],
                                                    alignment: AlignmentType.CENTER,
                                                }),
                                            ],
                                            verticalAlign: VerticalAlign.CENTER,
                                        }),
                                        new TableCell({
                                            children: [
                                                new Paragraph({
                                                    style: 'table-content',
                                                    children: [
                                                        new TextRun({
                                                            text: 'Thành tiền',
                                                            bold: true
                                                        }),
                                                    ],
                                                    alignment: AlignmentType.CENTER,
                                                }),
                                            ],
                                            verticalAlign: VerticalAlign.CENTER,
                                        }),
                                    ],
                                }),
                                ...services.map((item: any) => {
                                    const arr: any[] = []
                                    arr.push(
                                        new TableRow({
                                            height: { value: '0.8cm', rule: HeightRule.ATLEAST },
                                            children: [
                                                new TableCell({
                                                    children: [
                                                        new Paragraph({
                                                            style: 'table-content',
                                                            children: [
                                                                new TextRun({
                                                                    text: `${item.name}`,
                                                                }),
                                                            ],
                                                            alignment: AlignmentType.CENTER,
                                                        }),
                                                    ],
                                                    verticalAlign: VerticalAlign.CENTER,
                                                }),
                                                new TableCell({
                                                    children: [
                                                        new Paragraph({
                                                            style: 'table-content',
                                                            children: [
                                                                new TextRun({
                                                                    text: `${item.quantity}`,
                                                                }),
                                                            ],
                                                            alignment: AlignmentType.CENTER,
                                                        }),
                                                    ],
                                                    verticalAlign: VerticalAlign.CENTER,
                                                }),
                                                new TableCell({
                                                    children: [
                                                        new Paragraph({
                                                            style: 'table-content',
                                                            children: [
                                                                new TextRun({
                                                                    text: `${vnd.format(item.price)}`,
                                                                }),
                                                            ],
                                                            alignment: AlignmentType.CENTER,
                                                        }),
                                                    ],
                                                    verticalAlign: VerticalAlign.CENTER,
                                                }),
                                            ],
                                        }),
                                    )
                                    return arr
                                }).reduce((prev: string | any[], curr: any) => prev.concat(curr), []),

                                ...electricsWaterNum.map((item: any) => {
                                    const arr: any[] = []
                                    arr.push(
                                        new TableRow({
                                            height: { value: '0.8cm', rule: HeightRule.ATLEAST },
                                            children: [
                                                new TableCell({
                                                    children: [
                                                        new Paragraph({
                                                            style: 'table-content',
                                                            children: [
                                                                new TextRun({
                                                                    text: `${item.name}`,
                                                                }),
                                                            ],
                                                            alignment: AlignmentType.CENTER,
                                                        }),
                                                    ],
                                                    verticalAlign: VerticalAlign.CENTER,
                                                }),
                                                new TableCell({
                                                    width: { size: '8cm' },
                                                    children: [
                                                        new Table({
                                                            borders: {
                                                                insideHorizontal: {
                                                                    style: BorderStyle.THICK,
                                                                    size: 1,
                                                                },
                                                                insideVertical: {
                                                                    style: BorderStyle.THICK,
                                                                    size: 1,
                                                                },
                                                                bottom: {
                                                                    style: BorderStyle.NONE,
                                                                    size: 0,
                                                                },
                                                                top: {
                                                                    style: BorderStyle.NONE,
                                                                    size: 0,
                                                                },
                                                                right: {
                                                                    style: BorderStyle.NONE,
                                                                    size: 0,
                                                                },
                                                                left: {
                                                                    style: BorderStyle.NONE,
                                                                    size: 0,
                                                                },
                                                            },
                                                            width: { size: '8cm' },
                                                            rows: [
                                                                new TableRow({
                                                                    children: [
                                                                        new TableCell({
                                                                            children: [
                                                                                new Paragraph({
                                                                                    style: 'table-content',
                                                                                    children: [
                                                                                        new TextRun({
                                                                                            text: 'Số đầu',
                                                                                        }),
                                                                                    ],
                                                                                    alignment: AlignmentType.CENTER,
                                                                                }),
                                                                            ],
                                                                            verticalAlign: VerticalAlign.CENTER,
                                                                        }),
                                                                        new TableCell({
                                                                            children: [
                                                                                new Paragraph({
                                                                                    style: 'table-content',
                                                                                    children: [
                                                                                        new TextRun({
                                                                                            text: 'Số cuối',
                                                                                        }),
                                                                                    ],
                                                                                    alignment: AlignmentType.CENTER,
                                                                                }),
                                                                            ],
                                                                            verticalAlign: VerticalAlign.CENTER,
                                                                        }),
                                                                        new TableCell({
                                                                            children: [
                                                                                new Paragraph({
                                                                                    style: 'table-content',
                                                                                    children: [
                                                                                        new TextRun({
                                                                                            text: 'Số tiêu thụ',
                                                                                        }),
                                                                                    ],
                                                                                    alignment: AlignmentType.CENTER,
                                                                                }),
                                                                            ],
                                                                            verticalAlign: VerticalAlign.CENTER,
                                                                        }),
                                                                    ],
                                                                }),
                                                                new TableRow({
                                                                    children: [
                                                                        new TableCell({
                                                                            children: [
                                                                                new Paragraph({
                                                                                    style: 'table-content',
                                                                                    children: [
                                                                                        new TextRun({
                                                                                            text: `${item.firstNum}`,
                                                                                        }),
                                                                                    ],
                                                                                    alignment: AlignmentType.CENTER,
                                                                                }),
                                                                            ],
                                                                            verticalAlign: VerticalAlign.CENTER,
                                                                        }),
                                                                        new TableCell({
                                                                            children: [
                                                                                new Paragraph({
                                                                                    style: 'table-content',
                                                                                    children: [
                                                                                        new TextRun({
                                                                                            text: `${item.lastNum}`,
                                                                                        }),
                                                                                    ],
                                                                                    alignment: AlignmentType.CENTER,
                                                                                }),
                                                                            ],
                                                                            verticalAlign: VerticalAlign.CENTER,
                                                                        }),
                                                                        new TableCell({
                                                                            children: [
                                                                                new Paragraph({
                                                                                    style: 'table-content',
                                                                                    children: [
                                                                                        new TextRun({
                                                                                            text: `${item.quantity}`,
                                                                                        }),
                                                                                    ],
                                                                                    alignment: AlignmentType.CENTER,
                                                                                }),
                                                                            ],
                                                                            verticalAlign: VerticalAlign.CENTER,
                                                                        }),
                                                                    ],
                                                                }),
                                                            ],
                                                        }),
                                                    ],
                                                    verticalAlign: VerticalAlign.CENTER,
                                                }),
                                                new TableCell({
                                                    children: [
                                                        new Paragraph({
                                                            style: 'table-content',
                                                            children: [
                                                                new TextRun({
                                                                    text: `${vnd.format(item.price)}`,
                                                                }),
                                                            ],
                                                            alignment: AlignmentType.CENTER,
                                                        }),
                                                    ],
                                                    verticalAlign: VerticalAlign.CENTER,
                                                }),
                                            ],
                                        }),
                                    )
                                    return arr
                                }).reduce((prev: string | any[], curr: any) => prev.concat(curr), []),
                            ],
                        }),
                        new Paragraph({
                            style: 'content',
                            alignment: AlignmentType.LEFT,
                            children: [
                                new TextRun({
                                    text: 'Chi tiết thanh toán',
                                    bold: true,
                                    break: 1,
                                }),
                                new TextRun({
                                    text: `Tổng tiền dịch vụ: ${vnd.format(invoice.totalService)}`,
                                    break: 1,
                                }),
                                new TextRun({
                                    text: `Nợ tháng ${invoice.debtMonth}: ${vnd.format(invoice.debt)}`,
                                    break: 1,
                                }),
                                new TextRun({
                                    text: `Tổng tiền: ${vnd.format(invoice.totalPrice)}`,
                                    break: 1,
                                }),
                                new TextRun({
                                    text: `Giảm giá (đồng): ${invoice.discount}`,
                                    break: 1,
                                }),
                                new TextRun({
                                    text: `Thành tiền: ${vnd.format(invoice.totalPayment)}`,
                                    break: 1,
                                }),
                                new TextRun({
                                    text: `Tổng cộng: ${vnd.format(invoice.paidMoney)}`,
                                    break: 1,
                                }),
                            ]
                        }),
                        new Paragraph({
                            style: 'content',
                            children: [
                                new TextRun({
                                    text: `Khách hàng thanh toán bằng tiền mặt hoặc chuyển khoản theo thông tin sau:`,
                                    break: 1,
                                }),
                                ...banks.map((item: any) => {
                                    const arr: any[] = []
                                    arr.push(
                                        new TextRun({
                                            text: `Ngân hàng: ${item.bankName}`,
                                            break: 1,
                                        }),
                                        new TextRun({
                                            text: `Chủ tài khoản: ${item.accountOwner}`,
                                            break: 1,
                                        }),
                                        new TextRun({
                                            text: `Số tài khoản: ${item.bankNumber}`,
                                            break: 1,
                                        }),
                                    )
                                    return arr
                                }).reduce((prev: string | any[], curr: any) => prev.concat(curr), []),
                               
                            ]
                        })
                    ],
                },
            ],
        })
        return document
    }
}
