const host = 'https://api.appworks-school.tw';
let query = window.location.search.substring(1);
const rowDiv = document.getElementsByClassName('row')[0];
const logoBtn = document.getElementsByClassName('logo')[0];
const womanBtn = document.getElementById('nav-btn-woman');
const manBtn = document.getElementById('nav-btn-man');
const accBtn = document.getElementById('nav-btn-accessories');
const searchInput = document.getElementById('search-input');
const searchPanel = document.getElementsByClassName('search-panel')[0];
const headerTool = document.getElementsByClassName('header-tools-mini')[0];
const slideArea = document.getElementsByClassName('slide-area')[0];
const slideDot = document.getElementsByClassName('slide-dot')[0];
const cartQtyWeb = document.getElementsByClassName('cart-qty')[0];
const cartQtyMobile = document.getElementsByClassName('cart-qty')[1];
let nextPage = undefined;
let currentCategory = 'all';
let isLoading = false;

// Get Cart Data from Local Storage
if (localStorage['cart'] !== undefined) {
  cart = JSON.parse(localStorage['cart']);
} else {
  cart = {};
}

// Update Cart Badge
const updateCartBadge = () => {
  let cartCount = 0;
  for (let [key, value] of Object.entries(cart)) {
    cartCount += parseInt(value.qty);
  }

  cartQtyWeb.innerHTML = cartCount;
  cartQtyMobile.innerHTML = cartCount;
};
updateCartBadge();

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

// GET Product List
const getProductList = (page, callback) => {
  const xhr = new XMLHttpRequest();
  let url = host + '/api/1.0/products/' + currentCategory + '?paging=' + page;

  xhr.open('GET', url);
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        callback(xhr.responseText);
      } else {
        alert(`[${xhr.status}] ${xhr.statusText}`);
      }
    }
  };
  xhr.send();
};

// RENDER Product List
const renderProductList = data => {
  const dataObj = JSON.parse(data).data;
  //assign Next Page
  nextPage = JSON.parse(data).next_paging;

  Object.values(dataObj).forEach(item => {
    let productDiv = document.createElement('a');
    productDiv.className = 'col';
    productDiv.setAttribute('href', `pages/product.html?id=${item.id}`);

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

    // Color Box rendering
    const drawColorBox = item => {
      let colorArea = document.createElement('div');
      colorArea.className = 'color-tags-area';

      item.colors.forEach(color => {
        let colorDiv = document.createElement('div');
        colorDiv.className = 'color-tag';
        colorDiv.title = color.name;
        colorDiv.style.backgroundColor = '#' + color.code;
        colorArea.appendChild(colorDiv);
      });
      return colorArea;
    };
    // render data to template
    let template = `
            <img
              class="product-pic"
              src=${item.main_image}
            />
            <div class="color-tags-wrap">
                ${drawColorBox(item).innerHTML}
            </div>
            <div class="product-name">${item.title}</div>
            <div class="product-price">TWD.${item.price}</div>
          `;
    productDiv.innerHTML = template;
    rowDiv.appendChild(productDiv);
    //Loading
    isLoading = false;
  });
};

//INITIAL & CALL Product List
getProductList(0, response => {
  renderProductList(response);
});

//Search & GET
const search = callback => {
  const xhr = new XMLHttpRequest();
  const inputValue = document.getElementById('search-input').value;
  const url = host + '/api/1.0/products/search?keyword=' + inputValue;

  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        if (xhr.responseText != '{"data":[]}') {
          callback(xhr.responseText);
        } else {
          rowDiv.innerHTML = '<div class="no-result">搜尋結果：無相關商品</div>';
        }
      } else {
        alert(`[${xhr.status}] ${xhr.statusText}`);
      }
    }
  };
  xhr.open('GET', url);
  xhr.send();
};

searchInput.addEventListener('input', () => {
  if (searchInput.value.trim() != '') {
    rowDiv.innerHTML = '';
    search(renderProductList);
  }
});

//for mobile search
searchInput.addEventListener('click', () => {
  searchPanel.style.width = '100%';
  searchInput.style.border = 'solid 1px #979797';
  searchInput.style.borderRadius = '30px';
  headerTool.classList.add('header-tools');
});

//Scroll to Next Page (Infinite Scroll)

window.addEventListener('scroll', () => {
  if (
    document.documentElement.scrollTop + window.innerHeight + 60 >=
      document.body.offsetHeight &&
    nextPage !== undefined &&
    isLoading === false
  ) {
    isLoading = true;
    getProductList(nextPage, response => {
      renderProductList(response);
    });
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
  const dataObj = JSON.parse(response).data;

  Object.values(dataObj).forEach(item => {
    let picUrl = host + item.picture;
    let productUrl = './pages/product.html?id=' + item.product_id;

    let campaignSlide = document.createElement('div');
    campaignSlide.className = 'campaign-slide';

    let storyContainer = document.createElement('a');
    storyContainer.className = 'story-container fade';
    storyContainer.setAttribute('href', productUrl);
    storyContainer.style.backgroundImage = `url(${picUrl})`;

    let dot = document.createElement('span');
    dot.className = 'dot';

    let layoutStory = document.createElement('div');
    layoutStory.className = 'story';
    let storyText = item.story.replace(/\s+/g, '<br/>');
    layoutStory.innerHTML = storyText;

    slideArea.appendChild(campaignSlide);
    campaignSlide.appendChild(storyContainer);
    storyContainer.appendChild(layoutStory);

    slideDot.appendChild(dot);
  });
};

getCampaigns(host + '/api/1.0/marketing/campaigns', response => {
  renderCampaigns(response);
  let slideIndex = 0;
  const slides = document.getElementsByClassName('story-container');
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
