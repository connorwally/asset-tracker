import { AuthenticationStrategy } from "@loopback/authentication";
import {inject} from '@loopback/core';
import {HttpErrors, Request} from '@loopback/rest';
import * as jwt from 'jsonwebtoken';
import {UserService} from '../services/user.service';
import {UserProfile, securityId} from '@loopback/security';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export class JWTAuthStrategy implements AuthenticationStrategy{
    name = 'jwt';

    constructor(@inject('services.UserService') private userService: UserService){}

    async authenticate(request: Request): Promise<UserProfile | undefined> {
        const token = this.extractToken(request);
        if (!token) {
            throw new HttpErrors.Unauthorized('Token is required.');
        }
    
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as {userId: number};
            const user = await this.userService.verifyToken(token);
    
            if (!user.id) {
                throw new HttpErrors.Unauthorized('User ID is missing.');
            }
    
            return {
                [securityId]: user.id.toString(),
                email: user.email,
                role: user.role,
            };
        } catch (error) {
            throw new HttpErrors.Unauthorized('Token is invalid.');
        }
    }
    

    extractToken(request: Request): string | null{
        const authHeader = request.headers.authorization;
        if (!authHeader) return null;
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
        return parts[1];
    }
}