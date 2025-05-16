export interface IUserLoginDto {
    email: string;
    password: string;
    location: string; // Required for cinema-specific login
}

/**
 * User Login Data Transfer Object
 * This class handles the transformation of user login data
 * between the client and server
 */
export class UserLoginDto implements IUserLoginDto {
    email!: string;
    password!: string;
    location!: string; // Changed to required
    
    /**
     * Constructor that accepts an optional data object
     * and maps its properties to this instance
     * @param data Optional user login data
     */
    constructor(data?: IUserLoginDto) {
        if (data) {
            // Copy all properties from the data object to this instance
            for (const property in data) {
                if (data.hasOwnProperty(property)) {
                    (<any>this)[property] = (<any>data)[property];
                }
            }
        }
    }
    
    /**
     * Initialize this instance with data from any object
     * @param _data The data to initialize with
     */
    init(_data?: any) {
        if (_data) {
            this.email = _data["email"];
            this.password = _data["password"];
            this.location = _data["location"];
        }
    }
    
    /**
     * Create a new UserLoginDto from a plain JavaScript object
     * @param data The source data
     */
    static fromJS(data: any): UserLoginDto {
        data = typeof data === 'object' ? data : {};
        let result = new UserLoginDto();
        result.init(data);
        return result;
    }
    
    /**
     * Convert this instance to a plain JavaScript object
     * suitable for sending to the server
     * @param data Optional existing object to extend
     */
    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["email"] = this.email;
        data["password"] = this.password;
        
        // Always include location in the request
        data["location"] = this.location || '';
        
        return data;
    }
    
    /**
     * Create a deep copy of this instance
     */
    clone(): UserLoginDto {
        return UserLoginDto.fromJS(this.toJSON());
    }
}