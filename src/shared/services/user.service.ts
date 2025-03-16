import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { UserLoginDto } from "../dtos/userDto.dto";
import { catchError, Observable, throwError } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = 'http://127.0.0.1:3000/users/login';

    constructor(private http: HttpClient) { }

    login(user: UserLoginDto): Observable<UserLoginDto> {
        return this.http.post<UserLoginDto>(this.apiUrl, user.toJSON()).pipe(
            catchError(this.handleError)
        );
    }

    private handleError(error: any): Observable<never> {
        console.error('LoginService Error:', error);
        return throwError(() => new Error(error.message || 'Server error'));
    }

}