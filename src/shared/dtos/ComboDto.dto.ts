export interface IComboDto {
    id?: string;
    combo_id: string;
    user_id: string;
    name_combo: string;
    price_combo: number;
    description_combo: string;
    image_combo: string;
    quantity?: number; // ✅ thêm dòng này

    createdAt?: Date;
    updatedAt?: Date;
}

export class ComboDto implements IComboDto {
    id: string = '';
    combo_id: string = '';
    user_id: string = '';
    name_combo: string = '';
    price_combo: number = 0;
    description_combo: string = '';
    image_combo: string = '';
    quantity?: number; // ✅ thêm dòng này
    createdAt?: Date;
    updatedAt?: Date;

    constructor(data?: IComboDto) {
        if (data) {
            for (const property in data) {
                if (data.hasOwnProperty(property)) {
                    (this as any)[property] = (data as any)[property];
                }
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.id = _data["_id"];
            this.combo_id = _data["combo_id"];
            this.user_id = _data["user_id"];
            this.name_combo = _data["name_combo"];
            this.price_combo = _data["price_combo"];
            this.description_combo = _data["description_combo"];
            this.image_combo = _data["image_combo"];
            this.quantity = _data["quantity"]; // ✅ thêm dòng này
            this.createdAt = _data["createdAt"];
            this.updatedAt = _data["updatedAt"];
        }
    }

    static fromJS(data: any): ComboDto {
        data = typeof data === 'object' ? data : {};
        let result = new ComboDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        if (this.id) {
            data["_id"] = this.id;
        }
        data["combo_id"] = this.combo_id;
        data["user_id"] = this.user_id;
        data["name_combo"] = this.name_combo;
        data["price_combo"] = this.price_combo;
        data["description_combo"] = this.description_combo;
        data["image_combo"] = this.image_combo;
        data["quantity"] = this.quantity; // ✅ thêm dòng này
        data["createdAt"] = this.createdAt;
        data["updatedAt"] = this.updatedAt;
        return data;
    }

    clone(): ComboDto {
        return ComboDto.fromJS(this.toJSON());
    }
}
