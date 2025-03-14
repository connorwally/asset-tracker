import {injectable, BindingScope} from '@loopback/core';
import {repository} from '@loopback/repository';
import {UserRepository} from '../repositories/user.repository';
import {User} from '../models/user.model';
import {HttpErrors} from '@loopback/rest';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

@injectable({scope: BindingScope.TRANSIENT})
export class UserService{
    constructor(
        @repository(UserRepository) private userRepository: UserRepository
    ){}

    async register(email: string, password: string): Promise<User>{
        const userExists = !!(await this.userRepository.count({email}));
        if(userExists){
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
        const user = await this.userRepository.findOne({where: {email}});
        if(!user){
            throw new HttpErrors.NotFound('User not found.');
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if(!passwordMatch){
            throw new HttpErrors.Unauthorized('Password is incorrect.');
        }

        const token = jwt.sign({userId: user.id, email: user.email, role: user.role}, JWT_SECRET, {expiresIn: '1d'});

        return {token};
    }

    async verifyToken(token: string): Promise<User>{
        try{
            const decoded = jwt.verify(token, JWT_SECRET) as {userId: number};
            const user = await this.userRepository.findById(decoded.userId);
            return user;
        }
        catch(err){
            throw new Error('Token is invalid or expired.');
        }
    }
}