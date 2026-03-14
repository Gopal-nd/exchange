import { createClient, type RedisClientType  } from 'redis'
import type { MessageToEngine } from './types/to';
import type { MessageFromOrderbook } from './types/index';


export class RedisManager {
    private client:RedisClientType;
    private publisher: RedisClientType;
    private static instance: RedisManager

    constructor(){
        this.client = createClient()
        this.client.connect()
        this.publisher = createClient()
        this.publisher.connect()
    }

    public static getInstance(){
        if(!this.instance){
            this.instance = new RedisManager()
        }
        return this.instance
    }

    public sendAndAwait(message:MessageToEngine){
        return new Promise<MessageFromOrderbook>((resolve,reject)=>{
            const id = this.getRandomClientId()
            this.client.subscribe(id,(message)=>{
                this.client.unsubscribe(id)
                resolve(JSON.parse(message))
            })
            this.publisher.lPush("messages",JSON.stringify({clientId:id,message}))
        })
    }

    public getRandomClientId(){
        return Math.random().toString(30).substring(2,15) + Math.random().toString(30).substring(2,15)
    }

}

