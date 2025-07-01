import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // eslint-disable-next-line prefer-template
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) {
    return null;
  }

  return (
    <div className="fixed right-0 bottom-0 m-4 p-4 border border-gray-300 rounded-md shadow-lg bg-white z-50">
      <div className="flex flex-col space-y-2">
        <div className="text-center">
          {offlineReady ? (
            <span className="text-green-500">App ready to work offline</span>
          ) : (
            <span className="text-blue-500">New content available, click on reload button to update.</span>
          )}
        </div>
        {needRefresh && (
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={() => updateServiceWorker(true)}
          >
            Reload
          </button>
        )}
        <button className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400" onClick={() => close()}>
          Close
        </button>
      </div>
    </div>
  );
}

export default ReloadPrompt; 