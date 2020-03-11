let currentCategory = 'all';

//Get Query String & Assign CurrentCategory
function getQueryString(category) {
  const queryString = window.location.search.substring(1);
  let queries = queryString.split('&');
  if (!queryString === true) {
    currentCategory = 'all';
  } else {
    for (i = 0; i < queries.length; i++) {
      let query = queries[i].split('=');
      if (query[0] == category) return query[1];
      currentCategory = query[1];
    }
  }
}
getQueryString();

//INITIAL & CALL Product List
getProductList(0, response => {
  renderProductList(response);
  // Navigation Highlight
  const womenNav = document.getElementById('nav-btn-woman');
  const menNav = document.getElementById('nav-btn-man');
  const accNav = document.getElementById('nav-btn-accessories');
  if (currentCategory == 'women') {
    menNav.classList.remove('nav-highlight');
    accNav.classList.remove('nav-highlight');
    womenNav.classList.add('nav-highlight');
  }
  if (currentCategory == 'men') {
    womenNav.classList.remove('nav-highlight');
    accNav.classList.remove('nav-highlight');
    menNav.classList.add('nav-highlight');
  }
  if (currentCategory == 'accessories') {
    menNav.classList.remove('nav-highlight');
    womenNav.classList.remove('nav-highlight');
    accNav.classList.add('nav-highlight');
  }
});

//Marketing Campaigns
const getCampaigns = (url, callback) => {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        callback(xhr.responseText);
      } else {
        alert(`[${xhr.status}] ${xhr.statusText}`);
      }
    }
  };
  xhr.open('GET', url);
  xhr.send();
};

const renderCampaigns = response => {
  const slideArea = document.querySelector('.slide-area');
  const slideDot = document.querySelector('.slide-dot');
  const dataObj = JSON.parse(response).data;

  Object.values(dataObj).forEach(item => {
    let picUrl = host + item.picture;
    let productUrl = './pages/product.html?id=' + item.product_id;

    let campaignSlide = createElm('div', 'campaign-slide');

    let storyContainer = createElm('a', 'story-container fade', 'href', productUrl);
    storyContainer.style.backgroundImage = `url(${picUrl})`;

    let dot = createElm('span', 'dot');

    let layoutStory = createElm('div', 'story');
    let storyText = item.story.replace(/\s+/g, '<br/>');
    layoutStory.innerHTML = storyText;

    slideArea.append(campaignSlide);
    campaignSlide.append(storyContainer);
    storyContainer.append(layoutStory);

    slideDot.append(dot);
  });
};

getCampaigns(host + '/api/1.0/marketing/campaigns', response => {
  renderCampaigns(response);
  let slideIndex = 0;
  const slides = document.getElementsByClassName('story-container');
  const slideDot = document.querySelector('.slide-dot');
  const dots = slideDot.childNodes;

  showSlides = () => {
    let i;

    for (i = 0; i < slides.length; i++) {
      slides[i].classList.remove('show');
    }
    for (i = 0; i < dots.length; i++) {
      dots[i].classList.remove('active');
    }

    if (slideIndex >= slides.length) {
      slideIndex = 0;
    }
    slides[slideIndex].classList.add('show');
    dots[slideIndex].classList.add('active');
    slideIndex = (slideIndex + 1) % 3;
  };

  showSlides();

  var dotsArray = [].slice.call(dots);
  for (let i = 0; i < dotsArray.length; i++) {
    dots[i].addEventListener('click', () => {
      slideIndex = i;
      showSlides();
    });
  }

  window.setInterval(showSlides, 5000);
});
