import React, { useEffect, useRef } from 'react';
import { OperatorMessage } from '../types';
import { OPERATOR_NAME, OPERATOR_AVATAR_URL } from '../constants';

interface OperatorPanelProps {
  messages: OperatorMessage[];
  loading: boolean;
}

const OperatorPanel: React.FC<OperatorPanelProps> = ({ messages, loading }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-cyber-purple/40 border border-cyber-cyan/30 rounded-xl overflow-hidden backdrop-blur-md shadow-lg">
      {/* Header */}
      <div className="p-3 bg-cyber-purple/60 border-b border-cyber-cyan/30 flex items-center gap-3">
        <div className="relative">
          <img 
            src={OPERATOR_AVATAR_URL} 
            alt="Operator" 
            className="w-12 h-12 rounded-full border-2 border-cyber-pink shadow-[0_0_10px_#d946ef]"
          />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border border-black animate-pulse"></div>
        </div>
        <div>
          <h3 className="font-tech text-cyber-cyan font-bold tracking-wider">{OPERATOR_NAME}</h3>
          <p className="text-xs text-purple-200">AI NAVIGATOR // ONLINE</p>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-white/30 text-sm italic mt-10">
            System linked. Waiting for connection...
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white/10 border border-white/10 rounded-2xl rounded-tl-none px-4 py-2 max-w-[90%] text-sm md:text-base text-white shadow-sm">
              {msg.text}
            </div>
            <span className="text-[10px] text-white/30 ml-2 mt-1">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        
        {loading && (
          <div className="flex items-center gap-2 ml-2 text-cyber-pink text-xs">
            <span className="w-1.5 h-1.5 bg-cyber-pink rounded-full animate-bounce"></span>
            <span className="w-1.5 h-1.5 bg-cyber-pink rounded-full animate-bounce delay-100"></span>
            <span className="w-1.5 h-1.5 bg-cyber-pink rounded-full animate-bounce delay-200"></span>
            typing...
          </div>
        )}
      </div>
    </div>
  );
};

export default OperatorPanel;