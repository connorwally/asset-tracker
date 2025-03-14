import {service} from '@loopback/core';
import {post, requestBody} from '@loopback/rest';
import {UserService} from '../services/user.services';

export class AuthController{
    constructor(
        @service(UserService) private userService: UserService,
    ){}

    @post('/register')
    async register(
        @requestBody() {email, password}: {email: string, password: string}
    ){
        return this.userService.register(email, password);
    }

    @post('/login')
    async login(
        @requestBody() {email, password}: {email: string; password: string},
    ){
        return this.userService.login(email, password);
    }
}