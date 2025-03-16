export interface IUserLoginDto {
    email: string;
    password: string;
}
export class UserLoginDto implements IUserLoginDto {
    email!: string;
    password!: string;


    constructor(data?: IUserLoginDto) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }
    init(_data?: any) {
        if (_data) {
            this.email = _data["email"];
            this.password = _data["password"];

        }
    }
    static fromJS(data: any): UserLoginDto {
        data = typeof data === 'object' ? data : {};
        let result = new UserLoginDto();
        result.init(data);
        return result;
    }
    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["email"] = this.email;
        data["password"] = this.password;


        return data;
    }
    clone(): UserLoginDto {
        return UserLoginDto.fromJS(this.toJSON());
    }


}
