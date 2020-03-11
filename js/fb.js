// Redirect to Profile Page
const goToProfile = () => {
  let currentUrl = location.href;
  if (currentUrl.indexOf('pages') !== -1) {
    window.location.replace('./profile.html');
  } else {
    window.location.replace('./pages/profile.html');
  }
};

// Check Facebook Login & App Authorization Status
const statusCheck = response => {
  if (response.status === 'connected') {
    // The person logged into Facebook
    goToProfile();
  } else {
    // The person is not logged into Facebook
    FB.login(
      function(response) {
        if (response.authResponse) {
          goToProfile();
        }
      },
      {scope: 'email', return_scopes: true}
    );
  }
};

// Facebook Initializer
window.fbAsyncInit = function() {
  FB.init({
    appId: '2496893400594199',
    cookie: true,
    xfbml: true,
    version: 'v5.0'
  });

  FB.AppEvents.logPageView();
};

// Add Member Button Click Event Listener
const memberBtnWeb = document.getElementById('member-btn-web');
const memberBtnMob = document.getElementById('member-btn-mobile');

memberBtnWeb.addEventListener('click', () => {
  FB.getLoginStatus(function(response) {
    statusCheck(response);
  });
});

memberBtnMob.addEventListener('click', () => {
  FB.getLoginStatus(function(response) {
    statusCheck(response);
  });
});

// Facebook Core Function
(function(d, s, id) {
  var js,
    fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {
    return;
  }
  js = d.createElement(s);
  js.id = id;
  js.src = 'https://connect.facebook.net/en_US/sdk.js';
  fjs.parentNode.insertBefore(js, fjs);
})(document, 'script', 'facebook-jssdk');
