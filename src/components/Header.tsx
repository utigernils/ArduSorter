import { Wrench } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white border-b border-suva-border">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-suva-blue rounded-lg flex items-center justify-center">
            <Wrench className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-suva-dark tracking-tight">
              ArduSorter
            </h1>
            <p className="text-sm text-gray-500 font-light">
              ArduSorter Control Interface
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
