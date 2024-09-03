import md5 from 'md5';
import CONFIG from "../../config";
import Store from "../store/Store";
import { TAnswer, TError, TMessages, TMessagesResponse, TUser } from "./types";

const { CHAT_TIMESTAMP, HOST } = CONFIG;

class Server {
    HOST = HOST;
    store: Store;
    chatInterval: NodeJS.Timer | null = null;

    constructor(store: Store) {
        this.store = store;
    }

    // посылает запрос и обрабатывает ответ
    private async request<T>(method: string, params: { [key: string]: string } = {}): Promise<T | null> {
        const unknownError: TError = {
            code: 9000,
            text: 'Unknown error',
        }
        try {
            params.method = method;
            const token = this.store.getToken();
            if (token) {
                params.token = token;
            }
            const response = await fetch(`${this.HOST}/?${Object.keys(params).map(key => `${key}=${params[key]}`).join('&')}`);
            const answer: TAnswer<T> = await response.json();
            if (answer.result === 'ok' && answer.data) {
                return answer.data;
            }
            return null;
            //return answer.error || unknownError;
        } catch (e) {
            console.log(e);
            return null;
            //return unknownError;
        }
    }

    async login(login: string, password: string): Promise<boolean> {
        const rnd = Math.round(Math.random() * 100000);
        const hash = md5(`${md5(`${login}${password}`)}${rnd}`);
        const user = await this.request<TUser>('login', { login, hash, rnd: `${rnd}` });
        if (user) {
            this.store.setUser(user);
            return true;
        }
        return false;
    }

    async logout() {
        const result = await this.request<boolean>('logout');
        if (result) {
            this.store.clearUser();
        }
    }

    registration(login: string, password: string, name: string): Promise<boolean | null> {
        const hash = md5(`${login}${password}`);
        return this.request<boolean>('registration', { login, hash, name });
    }

    sendMessage(message: string): void {
        this.request<boolean>('sendMessage', { message });
    }

    async getMessages(): Promise<TMessages | null> {
        const hash = this.store.getChatHash();
        const result = await this.request<TMessagesResponse>('getMessages', { hash });
        if (result) {
            this.store.setChatHash(result.hash);
            return result.messages;
        }
        return null;
    }

    startChatMessages(cb: () => void): void {
        this.chatInterval = setInterval(async () => {
            const messages = await this.getMessages();
            if (messages) {
                this.store.addMessages(messages);
                cb();
            }
        }, CHAT_TIMESTAMP);

    }

    stopChatMessages(): void {
        if (this.chatInterval) {
            clearInterval(this.chatInterval);
            this.chatInterval = null;
            this.store.clearMessages();
        }
    }
}

export default Server;