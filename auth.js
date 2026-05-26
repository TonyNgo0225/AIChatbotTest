const msalConfig = {
  auth: {
    clientId: 'YOUR_AZURE_APP_CLIENT_ID',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: window.location.origin + window.location.pathname
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false
  }
};

const loginRequest = {
  scopes: ['openid', 'profile', 'email']
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

function ensureAuthBanner() {
  let banner = document.getElementById('authBanner');
  if (banner) return banner;

  banner = document.createElement('div');
  banner.id = 'authBanner';
  banner.className = 'page-note meta-row';
  banner.innerHTML = '<span id="authStatus"><strong>Microsoft Account:</strong> Checking sign-in status...</span><button type="button" id="logoutBtn" class="danger">Sign out</button>';

  const main = document.querySelector('main');
  const firstBox = main?.querySelector('.box');
  if (main && firstBox) {
    main.insertBefore(banner, firstBox);
  }

  return banner;
}

async function forceMicrosoftSignIn() {
  const banner = ensureAuthBanner();
  const authStatus = banner?.querySelector('#authStatus');
  const logoutBtn = banner?.querySelector('#logoutBtn');

  try {
    const response = await msalInstance.handleRedirectPromise();
    if (response?.account) {
      msalInstance.setActiveAccount(response.account);
    }

    const account = msalInstance.getActiveAccount() || msalInstance.getAllAccounts()[0] || null;

    if (!account) {
      await msalInstance.loginRedirect(loginRequest);
      return;
    }

    msalInstance.setActiveAccount(account);
    if (authStatus) {
      authStatus.textContent = `Microsoft Account: Signed in as ${account.name || account.username}`;
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await msalInstance.logoutRedirect({ account });
      });
    }
  } catch (error) {
    console.error('MSAL authentication error', error);
    if (authStatus) {
      authStatus.textContent = 'Microsoft Account: Authentication failed. Check console and Azure app settings.';
    }
  }
}

forceMicrosoftSignIn();
