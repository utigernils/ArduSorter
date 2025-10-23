import { GithubIcon } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-suva-border mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 font-light flex items-center space-x-4">
            <div className="flex items-center">
              <span className="mr-2">Built by</span>
              <a href="https://utigernils.ch" className="underline" target="_blank" rel="noopener noreferrer">
                Nils Utiger
              </a>
            </div>

            <a
              href="https://github.com/utigernils/ArduSorter"
              className="flex items-center text-gray-500 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GithubIcon className="w-5 h-5 mr-2" />
              View repo
            </a>
          </div>

          <div className="text-sm text-gray-500 font-light">
            Powered by TensorFlow.js &amp; Web Serial API
          </div>
        </div>
      </div>
    </footer>
  );
}
