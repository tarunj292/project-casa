import React, { FC } from 'react';
import { Chatbot } from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';
import config from '../config';
import MessageParser from './MessageParser';
import ActionProvider from './ActionProvider';

const ChatbotComponent: FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
  if (!visible) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 max-w-xs w-full shadow-xl">
      <div className="bg-gray-800 p-2 rounded-lg text-right">
        <button onClick={onClose} className="text-white text-sm">× Close</button>
        <Chatbot config={config} messageParser={MessageParser} actionProvider={ActionProvider} />
      </div>
    </div>
  );
};

export default ChatbotComponent;
