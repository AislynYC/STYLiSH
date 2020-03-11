window.fbAsyncInit = function() {
  FB.init({
    appId: '2496893400594199',
    cookie: true,
    xfbml: true,
    version: 'v5.0'
  });

  const profileStatusCheck = response => {
    if (response.status === 'connected') {
      // The person logged into Facebook
      renderProfile();
    } else {
      // The person is not logged into Facebook
      FB.login(
        function(response) {
          if (response.authResponse) {
            renderProfile();
          }
        },
        {scope: 'email', return_scopes: true}
      );
    }
  };

  FB.getLoginStatus(function(response) {
    profileStatusCheck(response);
  });

  // Render Member Profile
  const renderProfile = () => {
    FB.api(
      '/me',
      'GET',
      {fields: 'id,name,email,picture.width(150).height(150)'},
      function(response) {
        const picDiv = document.getElementById('user-pic');
        const userPicImg = createElm(
          'img',
          'user-pic-img',
          'src',
          response.picture.data.url
        );
        picDiv.append(userPicImg);

        const nameDiv = document.getElementById('user-name');
        nameDiv.append(response.name);

        const emailDiv = document.getElementById('user-email');
        emailDiv.append(response.email);
      }
    );
  };
};

// Click Event Listener for Tabs
for (let i = 0; i < 4; i++) {
  let tab = document.getElementById(`tab${i}`);
  let tabInner = document.getElementById(`tab-inner${i}`);
  tab.addEventListener('click', () => {
    for (let i = 0; i < 4; i++) {
      let innerSiblings = getAllSiblings(tabInner, filter)[i];
      let tabSiblings = getAllSiblings(tab, filter)[i];
      tabSiblings.classList.remove('active-tab');
      innerSiblings.classList.remove('show-tab');
    }
    tab.classList.add('active-tab');
    tabInner.classList.add('show-tab');
  });
}
