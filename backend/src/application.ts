import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';
import {UserService} from './services/user.service';
import { RedisService } from './services/redis.service';
import { JWTAuthStrategy } from './authentication-strategies/JWTAuthStrategy';
import {AuthenticationComponent, registerAuthenticationStrategy} from '@loopback/authentication';
import { ChatGPTController } from './controllers/ChatGPTController';
import { ChatGPTService } from './services/ChatGPTService';
import * as dotenv from 'dotenv';

dotenv.config();

export {ApplicationConfig};

export class AssetTrackerApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };

    this.bind('services.UserService').toClass(UserService);
    this.bind('services.RedisService').toClass(RedisService);
    this.bind('services.ChatGPTService').toClass(ChatGPTService);

    this.component(AuthenticationComponent);
    registerAuthenticationStrategy(this, JWTAuthStrategy);

    this.controller(ChatGPTController);
  }
}
