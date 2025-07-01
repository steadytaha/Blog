import React from 'react';
import { useSelector } from 'react-redux';
import { HiOutlineWifi, HiOutlineNoSymbol } from 'react-icons/hi2';

export default function OfflineIndicator() {
  const isOnline = useSelector((state) => state.network.isOnline);

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-full shadow-lg z-50 text-sm">
      <HiOutlineNoSymbol className="h-5 w-5" />
      <span>You are currently offline. Some features may be unavailable.</span>
    </div>
  );
} 