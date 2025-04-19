import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../shared/services/user.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UserLoginDto } from '../../../shared/dtos/userDto.dto';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let userServiceMock: jasmine.SpyObj<UserService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Tạo spy objects cho các dependencies
    userServiceMock = jasmine.createSpyObj('UserService', ['login']);
    routerMock = jasmine.createSpyObj('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule],
      declarations: [],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // Test validate email
  describe('validateEmail', () => {
    it('should return true for valid email', () => {
      expect(component.validateEmail('test@example.com')).toBeTruthy();
    });

    it('should return false for invalid email', () => {
      expect(component.validateEmail('invalid-email')).toBeFalsy();
      expect(component.validateEmail('invalid@')).toBeFalsy();
      expect(component.validateEmail('@example.com')).toBeFalsy();
    });
  });

  // Test handle email và password change
  describe('input handlers', () => {
    it('should clear email error when handleEmailChange is called', () => {
      component.emailError = 'Vui lòng nhập email';
      component.handleEmailChange();
      expect(component.emailError).toBe('');
    });

    it('should clear password error when handlePasswordChange is called', () => {
      component.passwordError = 'Vui lòng nhập mật khẩu';
      component.handlePasswordChange();
      expect(component.passwordError).toBe('');
    });

    it('should toggle password visibility', () => {
      component.showPassword = false;
      component.toggleShowPassword();
      expect(component.showPassword).toBeTruthy();
      component.toggleShowPassword();
      expect(component.showPassword).toBeFalsy();
    });
  });

  // Test validation khi submit form
  describe('form validation', () => {
    it('should show error for empty email', () => {
      component.email = '';
      component.password = 'password123';
      const event = new Event('submit');
      spyOn(event, 'preventDefault');
      component.handleSubmit(event);
      expect(component.emailError).toBe('Vui lòng nhập email');
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should show error for invalid email format', () => {
      component.email = 'invalid-email';
      component.password = 'password123';
      const event = new Event('submit');
      spyOn(event, 'preventDefault');
      component.handleSubmit(event);
      expect(component.emailError).toBe('Email không hợp lệ');
    });

    it('should show error for empty password', () => {
      component.email = 'test@example.com';
      component.password = '';
      const event = new Event('submit');
      spyOn(event, 'preventDefault');
      component.handleSubmit(event);
      expect(component.passwordError).toBe('Vui lòng nhập mật khẩu');
    });

    it('should show error for short password', () => {
      component.email = 'test@example.com';
      component.password = '12345';
      const event = new Event('submit');
      spyOn(event, 'preventDefault');
      component.handleSubmit(event);
      expect(component.passwordError).toBe('Mật khẩu phải có ít nhất 6 ký tự');
    });
  });

  // Test login success
  describe('login process', () => {
    it('should call login service with correct parameters', fakeAsync(() => {
      component.email = 'test@example.com';
      component.password = 'password123';
      
      const mockResponse = {
        data: {
          _id: '123',
          user_name: 'Test User',
          email: 'test@example.com',
          role: 2,
          token: 'mock-token'
        }
      };
      
      userServiceMock.login.and.returnValue(of(mockResponse));
      
      const event = new Event('submit');
      spyOn(event, 'preventDefault');
      component.handleSubmit(event);
      
      // Verify UserLoginDto is created and login is called
      expect(userServiceMock.login).toHaveBeenCalled();
      const loginArg = userServiceMock.login.calls.mostRecent().args[0];
      expect(loginArg instanceof UserLoginDto).toBeTruthy();
      expect(loginArg.email).toBe('test@example.com');
      expect(loginArg.password).toBe('password123');
      
      tick(100); // Wait for setTimeout in the login success handler
      
      // Verify navigation after login
      expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/layout');
    }));

    it('should handle login error', () => {
      component.email = 'test@example.com';
      component.password = 'password123';
      
      userServiceMock.login.and.returnValue(throwError(() => new Error('Login failed')));
      
      const event = new Event('submit');
      spyOn(event, 'preventDefault');
      component.handleSubmit(event);
      
      expect(component.emailError).toBe('Đăng nhập thất bại. Vui lòng thử lại.');
    });
  });

  // Test UI elements
  describe('UI elements', () => {
    let emailInput: DebugElement;
    let passwordInput: DebugElement;
    let submitButton: DebugElement;

    beforeEach(() => {
      emailInput = fixture.debugElement.query(By.css('#email'));
      passwordInput = fixture.debugElement.query(By.css('#password'));
      submitButton = fixture.debugElement.query(By.css('.login-button'));
    });

    it('should have email input field', () => {
      expect(emailInput).toBeTruthy();
    });

    it('should have password input field', () => {
      expect(passwordInput).toBeTruthy();
    });

    it('should have submit button', () => {
      expect(submitButton).toBeTruthy();
      expect(submitButton.nativeElement.textContent.trim()).toContain('Đăng nhập');
    });

    it('should reflect model changes in the view', () => {
      component.email = 'test@example.com';
      component.password = 'password123';
      fixture.detectChanges();
      
      expect(emailInput.nativeElement.value).toBe('test@example.com');
      expect(passwordInput.nativeElement.value).toBe('password123');
    });

    it('should update model when input values change', () => {
      emailInput.nativeElement.value = 'new@example.com';
      emailInput.nativeElement.dispatchEvent(new Event('input'));
      
      passwordInput.nativeElement.value = 'newpassword';
      passwordInput.nativeElement.dispatchEvent(new Event('input'));
      
      expect(component.email).toBe('new@example.com');
      expect(component.password).toBe('newpassword');
    });

    it('should call handleSubmit when form is submitted', () => {
      spyOn(component, 'handleSubmit');
      const form = fixture.debugElement.query(By.css('form'));
      form.triggerEventHandler('submit', null);
      expect(component.handleSubmit).toHaveBeenCalled();
    });
  });
});