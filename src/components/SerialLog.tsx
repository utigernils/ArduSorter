import { useEffect, useRef } from 'react';
import { ArrowUp, ArrowDown, Info } from 'lucide-react';
import { SerialMessage } from '../hooks/useSerialConnection';

interface SerialLogProps {
  messages: SerialMessage[];
}

export default function SerialLog({ messages }: SerialLogProps) {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-suva-border overflow-hidden">
      <div className="px-6 py-4 border-b border-suva-border">
        <h3 className="font-semibold text-suva-dark">Serial Communication Log</h3>
      </div>

      <div className="p-4 h-32 overflow-y-auto bg-gray-50 font-mono text-xs">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No messages yet. Connect to Arduino to see communication logs.
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 ${
                  msg.direction === 'sent' 
                    ? 'text-suva-blue' 
                    : msg.direction === 'received' 
                    ? 'text-green-600' 
                    : 'text-orange-600'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {msg.direction === 'sent' ? (
                    <ArrowUp className="w-3 h-3" />
                  ) : msg.direction === 'received' ? (
                    <ArrowDown className="w-3 h-3" />
                  ) : (
                    <Info className="w-3 h-3" />
                  )}
                </div>
                <span className="text-gray-500 flex-shrink-0">
                  {formatTime(msg.timestamp)}
                </span>
                <span className="break-all">{msg.data}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
