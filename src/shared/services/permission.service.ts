import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { PhanQuyenService } from './phanquyen.service';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { User } from '../dtos/phanquyenDto.dto';
/**
 * Unified service for managing permissions throughout the application
 * This service combines functionality from both UserService and PhanQuyenService
 * for a more consistent approach to permission management
 */
@Injectable({
    providedIn: 'root'
})
export class PermissionService {
    // Role constants for better readability
    public static readonly ROLE_USER = 1;     // Regular user
    public static readonly ROLE_ADMIN = 2;    // Administrator
    public static readonly ROLE_STAFF = 3;    // Staff member
    public static readonly ROLE_SUPER_ADMIN = 4; // Super Administrator

    // Role names for display - fix by adding index signature
    private roleNames: {[key: number]: string} = {
        1: 'Thành viên',
        2: 'Quản trị viên',
        3: 'Nhân viên rạp',
        4: 'Super Admin'
    };

    constructor(
        private userService: UserService,
        private phanQuyenService: PhanQuyenService
    ) { }
    /**
     * Get the currently logged in user
     * First checks localStorage, then falls back to API call if needed
     */
    getCurrentUser(): Observable<User | null> {
        // First try to get from local storage for efficiency
        const savedUser = this.phanQuyenService.getSavedCurrentUser();
        if (savedUser) {
            return of(savedUser);
        }

        // If not in localStorage, make API call
        return this.phanQuyenService.getCurrentUser().pipe(
            map(user => {
                if (user) {
                    // Save user to localStorage for future use
                    this.phanQuyenService.saveCurrentUser(user);
                }
                return user;
            }),
            catchError(error => {
                console.error('Error getting current user:', error);
                return of(null);
            })
        );
    }

    /**
     * Check if the current user has a specific role
     * @param roleId The role to check for
     */
    hasRole(roleId: number): Observable<boolean> {
        return this.getCurrentUser().pipe(
            map(user => {
                if (!user) return false;
                return Number(user.role) === roleId;
            })
        );
    }

    /**
     * Check if the current user is an admin
     */
    isAdmin(): Observable<boolean> {
        return this.hasRole(PermissionService.ROLE_ADMIN);
    }

    /**
     * Check if the current user is a super admin
     */
    isSuperAdmin(): Observable<boolean> {
        return this.hasRole(PermissionService.ROLE_SUPER_ADMIN);
    }

    /**
     * Check if the current user is a staff member
     */
    isStaff(): Observable<boolean> {
        return this.hasRole(PermissionService.ROLE_STAFF);
    }

    /**
     * Check if the current user is a regular user
     */
    isRegularUser(): Observable<boolean> {
        return this.hasRole(PermissionService.ROLE_USER);
    }

    /**
     * Check if the current user has permission to access a specific feature
     * @param requiredRoles Array of roles that have access to the feature
     */
    hasPermission(requiredRoles: number[]): Observable<boolean> {
        return this.getCurrentUser().pipe(
            map(user => {
                if (!user) return false;
                return requiredRoles.includes(Number(user.role));
            })
        );
    }

    /**
     * Get the display name for a role
     * @param roleId The role ID
     */
    getRoleName(roleId: number): string {
        return this.roleNames[roleId] || 'Không xác định';
    }

    /**
     * Check if a user is active
     * @param user The user to check
     */
    isUserActive(user: User): boolean {
        return user.isActive !== false; // Consider undefined as active
    }

    /**
     * Helper to compare user IDs safely (handles different formats)
     * @param userId1 First user ID
     * @param userId2 Second user ID
     */
    isSameUser(userId1: any, userId2: any): boolean {
        // Handle if userId is an object
        const id1 = typeof userId1 === 'object' ? (userId1._id || userId1.userId || userId1.id) : userId1;
        const id2 = typeof userId2 === 'object' ? (userId2._id || userId2.userId || userId2.id) : userId2;

        return id1 === id2;
    }
}
