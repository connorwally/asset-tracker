import {injectable, BindingScope} from '@loopback/core';
import Redis from 'ioredis';

@injectable({scope: BindingScope.SINGLETON})
export class RedisService{
    private redis: Redis.Redis;

    constructor(){
        this.redis = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: Number(process.env.REDIS_PORT) || 6379,
        });
    }

    async setKey(key: string, value: string, expireSeconds?: number): Promise<void>{
        if(expireSeconds){
            await this.redis.setex(key, expireSeconds, value);
        } else{
            await this.redis.set(key, value);
        }
    }

    async getKey(key: string): Promise<string | null>{
        return this.redis.get(key);
    }

    async deleteKey(key: string): Promise<void>{
        await this.redis.del(key);
    }
}