const host = 'https://api.appworks-school.tw';
let cart;
let nextPage = undefined;
let isLoading = false;

// Element Creator
const createElm = (elmType, elmClass, ...theArgs) => {
  const elm = document.createElement(elmType);
  if (elmClass !== null) {
    elm.className = elmClass;
  }
  for (let i = 0; i < theArgs.length; i += 2) {
    elm.setAttribute(theArgs[i], theArgs[i + 1]);
  }
  return elm;
};

// Get Cart Data from Local Storage
const getLocalStorage = () => {
  if (localStorage['cart'] !== undefined) {
    cart = JSON.parse(localStorage['cart']);
  } else {
    cart = {};
  }
};
getLocalStorage();

// Update Cart Badge
const updateCartBadge = () => {
  const cartQtyWeb = document.getElementsByClassName('cart-qty')[0];
  const cartQtyMobile = document.getElementsByClassName('cart-qty')[1];
  let cartCount = 0;

  for (let [key, value] of Object.entries(cart)) {
    cartCount += parseInt(value.qty);
  }

  cartQtyWeb.innerHTML = cartCount;
  cartQtyMobile.innerHTML = cartCount;
};
updateCartBadge();

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
  const rowDiv = document.getElementsByClassName('row')[0];
  const dataObj = JSON.parse(data).data;
  //assign Next Page
  nextPage = JSON.parse(data).next_paging;

  Object.values(dataObj).forEach(item => {
    const productDiv = createElm('a', 'col');
    const currentUrl = location.href;
    if (currentUrl.indexOf('pages') !== -1) {
      productDiv.setAttribute('href', `product.html?id=${item.id}`);
    } else {
      productDiv.setAttribute('href', `pages/product.html?id=${item.id}`);
    }
    // Color Box rendering
    const drawColorBox = item => {
      const colorArea = createElm('div', 'color-tags-area');

      item.colors.forEach(color => {
        const colorDiv = createElm('div', 'color-tag', 'title', color.name);
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
            <div class="name">${item.title}</div>
            <div class="product-price">TWD.${item.price}</div>
          `;
    productDiv.innerHTML = template;
    rowDiv.appendChild(productDiv);
  });
  //Loading
  isLoading = false;
};

const searchFeature = () => {
  const searchInput = document.getElementById('search-input');
  //Search & GET
  const search = callback => {
    const xhr = new XMLHttpRequest();
    const inputValue = searchInput.value;
    const rowDiv = document.getElementsByClassName('row')[0];
    const url = host + '/api/1.0/products/search?keyword=' + inputValue;

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          if (xhr.responseText !== '{"data":[]}') {
            callback(xhr.responseText);
          } else {
            rowDiv.innerHTML = '<div class="no-result">搜尋結果：無相關商品</div>';
            isLoading = false;
          }
        } else {
          alert(`[${xhr.status}] ${xhr.statusText}`);
        }
      }
    };
    xhr.open('GET', url);
    xhr.send();
  };
  // Event Listener for Searching
  searchInput.addEventListener('input', () => {
    const rowDiv = document.getElementsByClassName('row')[0];
    if (searchInput.value.trim() != '' && isLoading === false) {
      if (rowDiv !== undefined) {
        rowDiv.innerHTML = '';
        isLoading = true;
        search(renderProductList);
      } else {
        const content = document.querySelector('.content-area');
        const rowDiv = createElm('div', 'row');
        rowDiv.innerHTML = '';
        content.innerHTML = '';
        content.append(rowDiv);
        isLoading = true;
        search(renderProductList);
      }
    }
  });

  // Extend mobile search
  searchInput.addEventListener('click', () => {
    const searchPanel = document.querySelector('.search-panel');
    const headerTool = document.querySelector('.header-tools-mini');

    searchPanel.style.width = '110%';
    searchInput.style.border = 'solid 1px #979797';
    searchInput.style.borderRadius = '30px';
    headerTool.classList.add('header-tools');
  });
};
searchFeature();

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

// Get all siblings
function filter(elem) {
  switch (elem.nodeName.toUpperCase()) {
    case 'DIV':
      return true;
    case 'LI':
      return true;
    default:
      return false;
  }
}

function getAllSiblings(elem, filter) {
  var sibs = [];
  elem = elem.parentNode.firstChild;
  do {
    if (elem.nodeType === 3) continue; // text node
    if (!filter || filter(elem)) sibs.push(elem);
  } while ((elem = elem.nextSibling));
  return sibs;
}
