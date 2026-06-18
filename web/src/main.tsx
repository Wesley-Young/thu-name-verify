import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';

import App from './App.tsx';
import Finalize from './routes/Finalize.tsx';
import Landing from './routes/Landing.tsx';
import Register from './routes/Register.tsx';

// biome-ignore lint/style/noNonNullAssertion: We know that the root element exists in our HTML.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/finalize" element={<Finalize />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
