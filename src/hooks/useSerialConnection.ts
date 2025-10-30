import { useState, useCallback, useRef } from 'react';

export type ConnectionStatus = 'connected' | 'disconnected' | 'awaiting';

export interface SerialMessage {
  timestamp: Date;
  direction: 'sent' | 'received' | 'system';
  data: string;
}

export function useSerialConnection() {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [messages, setMessages] = useState<SerialMessage[]>([]);
  const portRef = useRef<any>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<string> | null>(null);
  const writerRef = useRef<WritableStreamDefaultWriter<string> | null>(null);

  const addMessage = useCallback((direction: 'sent' | 'received' | 'system', data: string) => {
    setMessages((prev) => [
      ...prev.slice(-99),
      { timestamp: new Date(), direction, data },
    ]);
  }, []);

  const connect = useCallback(async () => {
    try {
      if (!('serial' in navigator)) {
        alert('Web Serial API not supported in this browser. Please use Chrome or Edge.');
        return;
      }

      setStatus('awaiting');
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 115200 });

      portRef.current = port;
      setStatus('connected');

      const textDecoder = new TextDecoderStream();
      port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      readerRef.current = reader;

      const textEncoder = new TextEncoderStream();
      textEncoder.readable.pipeTo(port.writable);
      writerRef.current = textEncoder.writable.getWriter();

      (async () => {
        let buffer = '';
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) {
              buffer += value;
              
              let newlineIndex;
              while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
                const line = buffer.substring(0, newlineIndex).trim();
                buffer = buffer.substring(newlineIndex + 1);
                
                if (line) {
                  addMessage('received', line);
                }
              }
            }
          }
        } catch (error) {
          console.error('Serial read error:', error);
        }
      })();
    } catch (error) {
      console.error('Connection error:', error);
      setStatus('disconnected');
      alert('Failed to connect to Arduino. Please check the connection and try again.');
    }
  }, [addMessage]);

  const disconnect = useCallback(async () => {
    try {
      if (readerRef.current) {
        await readerRef.current.cancel();
        readerRef.current = null;
      }
      if (writerRef.current) {
        await writerRef.current.close();
        writerRef.current = null;
      }
      if (portRef.current) {
        await portRef.current.close();
        portRef.current = null;
      }
      setStatus('disconnected');
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }, []);

  const sendMessage = useCallback(async (data: string) => {
    if (writerRef.current && status === 'connected') {
      try {
        await writerRef.current.write(data);
        addMessage('sent', data);
      } catch (error) {
        console.error('Send error:', error);
      }
    }
  }, [status, addMessage]);

  return {
    status,
    messages,
    connect,
    disconnect,
    sendMessage,
    addMessage,
  };
}
