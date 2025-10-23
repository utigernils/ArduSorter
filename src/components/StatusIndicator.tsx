interface StatusIndicatorProps {
  status: 'connected' | 'disconnected' | 'awaiting';
  label: string;
}

export default function StatusIndicator({ status, label }: StatusIndicatorProps) {
  const colors = {
    connected: 'bg-green-500',
    disconnected: 'bg-gray-400',
    awaiting: 'bg-yellow-500',
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${colors[status]} shadow-sm`} />
      <span className="text-sm font-medium text-suva-dark">{label}</span>
    </div>
  );
}
