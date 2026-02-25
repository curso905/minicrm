import './style.css';
import { Clerk } from '@clerk/clerk-js';
import { initApp } from './app.js';

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

async function bootstrap() {
  const root = document.getElementById('app');
  if (!root) return;

  if (!publishableKey) {
    root.innerHTML = `
      <div class="min-h-screen flex items-center justify-center p-4">
        <p class="text-red-600">Falta VITE_CLERK_PUBLISHABLE_KEY en .env. Añádela desde <a href="https://dashboard.clerk.com" class="underline">Clerk Dashboard → API Keys</a>.</p>
      </div>
    `;
    return;
  }

  const clerk = new Clerk(publishableKey);
  await clerk.load();

  function renderApp() {
    initApp(clerk);
  }

  function renderSignIn() {
    root.innerHTML = '<div id="sign-in-root" class="min-h-screen flex items-center justify-center p-4"></div>';
    clerk.mountSignIn(root.querySelector('#sign-in-root'));
  }

  if (clerk.isSignedIn) {
    renderApp();
  } else {
    renderSignIn();
    clerk.addListener((payload) => {
      if (payload.session && clerk.isSignedIn) {
        location.reload();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', bootstrap);
