import React, { useContext, useEffect, useState, useMemo, useRef } from 'react';
import { ServerContext, StoreContext } from '../../App';
import { TMessages } from '../../services/server/types';
import Button from '../../components/Button/Button';
import { IBasePage, PAGES } from '../PageManager';

import './Chat.scss';

const Login: React.FC<IBasePage> = (props: IBasePage) => {
    const { setPage } = props;
    const server = useContext(ServerContext);
    const store = useContext(StoreContext);
    const [messages, setMessages] = useState<TMessages>([]);
    const [count, setCount] = useState<number>(0);
    const messageRef = useRef<HTMLInputElement>(null);
    const user = store.getUser();

    useEffect(() => {
        const newMessages = () => {
            setMessages(store.getMessages());
            setCount(count + 1);
        }

        if (user) {
            server.startChatMessages(newMessages);
        }

        return () => {
            server.stopChatMessages();
        }
    });

    const input = useMemo(() => <input ref={messageRef} placeholder='сообщение' />, []);

    const sendClickHandler = () => {
        if (messageRef.current) {
            const message = messageRef.current.value;
            if (message) {
                server.sendMessage(message);
                messageRef.current.value = '';
            }
        }
    }
    const backClickHandler = () => setPage(PAGES.LOGIN);

    if (!user) {
        return (<div className='chat'>
            <h1>Что-то пошло не так =(</h1>
            <Button onClick={backClickHandler} text='Назад' />
        </div>)
    }

    return (<div className='chat'>
        <h1>Чат</h1>
        <div className='chat-user-info'>
            <span>Привет!</span>
            <span>{user.name}</span>
        </div>
        <div className='chat-messages'>
            {messages.map((message, index) => <div key={index}>{`${message.author}: ${message.text}`}</div>)}
        </div>
        {input}
        <div className='chat-buttons'>
            <Button onClick={sendClickHandler} text='Отправить' />
            <Button onClick={backClickHandler} text='Назад' />
        </div>
    </div>)
}

export default Login;