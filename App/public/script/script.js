document.addEventListener("DOMContentLoaded", () => {

    });
    window.onload = function() {
    if (sessionStorage.getItem('msalLoggedIn')) {
   console.log("Logged in");
    //   document.getElementById('login-section').style.display = 'none';
     // document.getElementById('private-links').style.display = 'block';
    }
  };
  const msalConfig = {
    auth: {
      clientId: '8b1fadc1-8d5e-4543-a2d2-27675cdd49e2',//'95e880e8-e54d-4d01-a26c-052cff7e9592', // Replace with your application ID
      authority: 'https://login.microsoftonline.com/common', // Replace with your tenant ID
      redirectUri: 'https://arcadianoutfitters.com/auth/callback/'
    }
  };

  const msalInstance = new msal.PublicClientApplication(msalConfig);
  msalInstance.initialize().then(() => {
    // Redirect: once login is successful and redirects with tokens, call Graph API
    msalInstance.handleRedirectPromise().then(handleResponse).catch(err => {
        console.error(err);
    });
})

   //this one gets called when sign in happens
  async function signIn() {
    try {
      return msalInstance.loginRedirect({
        scopes: ['User.Read'],
        responseMode: 'query'
      });
      /*const loginResponse = await msalInstance.loginRedirect({
        scopes: ['User.Read'],
      });
      console.log('Login successful:', loginResponse);
      sessionStorage.setItem('msalLoggedIn', true);
      document.getElementById('cart').style.display = 'block';*/

    } catch (error) {
      console.error(error);
    }
  }
  var jwt_token = null;
  function handleResponse(response) {

    jwt_token = response;
    if(jwt_token==null){
      return;
    }
    //console.log("jwt token response: "+jwt_token);
        console.log("JWT View Loaded", jwt_token);
        fetch('https://arcadianoutfitters.com/auth/jwt_route?idToken='+jwt_token.idToken, {
    method: 'get', // or 'PUT'
    headers: {
        'Content-Type': 'application/json'
    }
    }).then(response => response.text())
    .then(function(response) {
        document.documentElement.innerHTML = response;
      }).catch(function(error) {
        console.log('Request failed', error);
      });
    //window.location.reload();;

}


  async function signOut() {
    await msalInstance.logoutPopup();
    sessionStorage.removeItem('msalLoggedIn');
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('logout-section').style.display = 'none';
    document.getElementById('private-links').style.display = 'none';
  }

   function toggleCheckboxContainer() {
  const checkboxContainer = document.getElementById('checkbox-container');
  checkboxContainer.classList.toggle('active');
}

async function fetchProfile() {
    try {
        const response = await fetch('profile', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const profile = await response.json();
        console.log('Profile:', profile);
    } catch (error) {
        console.error('Error fetching profile:', error);
    }
}

function domReady(fn) {
    if (
        document.readyState === "complete" ||
        document.readyState === "interactive"
    ) {
        setTimeout(fn, 1000);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}


function hideDiv(event) {
    const parentElement = event.target.parentElement;
    if (parentElement) {
        parentElement.style.display = 'none';
    }
}

