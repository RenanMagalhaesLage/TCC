import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {BrowserRouter} from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <GoogleOAuthProvider clientId="665809770681-7cmh6ghco9fgrc2c1t70ug8t5pa35v88.apps.googleusercontent.com" key='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'>
        <App />
      </GoogleOAuthProvider>;
    </BrowserRouter>
  </StrictMode>,
)
