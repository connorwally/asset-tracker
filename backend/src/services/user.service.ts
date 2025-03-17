import {injectable, BindingScope, inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {UserRepository} from '../repositories/user.repository';
import {User} from '../models/user.model';
import {HttpErrors} from '@loopback/rest';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { RedisService } from './redis.service';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

@injectable({scope: BindingScope.TRANSIENT})
export class UserService{
    constructor(
        @repository(UserRepository) private userRepository: UserRepository,
        @inject('services.RedisService') private redisService: RedisService,
    ){}

    async register(email: string, password: string): Promise<User>{

        const userCount = await this.userRepository.count({email});
        if(userCount.count > 0){
            throw new HttpErrors.BadRequest('User already exists.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await this.userRepository.create({
            email,
            password: hashedPassword,
            role: 'user',
        });

        return newUser;
    }

    async login(email: string, password: string): Promise<{token: string}>{

        const key = `login_attempts:${email}`;
        let attempts = await this.redisService.getKey(key);
        const attemptCount = attempts ? Number(attempts) : 0;

        if(attempts && Number(attempts) >= 5){
            throw new HttpErrors.TooManyRequests('Too many login attempts. Please try again later.');
        }

        const user = await this.userRepository.findOne({where: {email}});
        if(!user){
            throw new HttpErrors.NotFound('User not found.');
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if(!passwordMatch){
            await this.redisService.setKey(key, (attemptCount + 1).toString(), 900); 
            throw new HttpErrors.Unauthorized('Password is incorrect.');
        }

        await this.redisService.deleteKey(key);

        const token = jwt.sign({userId: user.id, email: user.email, role: user.role}, JWT_SECRET, {expiresIn: '1d'});

        return {token};
    }

    async verifyToken(token: string): Promise<User> {
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as {userId: number};
            const user = await this.userRepository.findById(decoded.userId);
            
            if (!user) {
                throw new HttpErrors.Unauthorized('User not found.');
            }
            
            return user;
        }
        catch(err) {
            throw new HttpErrors.Unauthorized('Token is invalid or expired.');
        }
    }
}