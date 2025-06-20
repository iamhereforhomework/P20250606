import React from 'react';
import { createRoot } from 'react-dom/client';
import { setupIonicReact } from '@ionic/react';
import App from './App';

// 初始化 Ionic React
setupIonicReact({
  rippleEffect: true,
  mode: 'ios', // 或者 'md' 用于 Material Design
});

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container not found');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);