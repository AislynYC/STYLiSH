const listDiv = document.getElementsByClassName('list')[0];

// Get Product Details
const getProductDetail = (productId, variant, callback) => {
  const xhr = new XMLHttpRequest();
  let url = host + '/api/1.0/products/details?id=' + productId;

  xhr.open('GET', url);
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        callback(variant, xhr.responseText);
      } else {
        alert(`[${xhr.status}] ${xhr.statusText}`);
      }
    }
  };
  xhr.send();
};

// Render Selected Products from LocalStorage
const renderSelProducts = (variant, data) => {
  const dataObj = JSON.parse(data).data;

  // Check Stock
  const variants = dataObj.variants;
  const checkVariantStock = (color, size) => {
    const variant = variants.find(item => {
      return item.color_code === color && item.size === size;
    });
    return variant.stock;
  };

  let stock = checkVariantStock(variant.colorCode, variant.size);

  // Create Product List
  const productList = createElm('div', 'product-list');
  const productItem = createElm('div', 'product-item');

  listDiv.append(productList);
  productList.append(productItem);

  const imgInfoWrap = createElm(
    'a',
    'img-info-wrap',
    'href',
    `./product.html?id=${variant.id}`
  );
  productItem.append(imgInfoWrap);

  // Create Product Image
  const productImgWrap = createElm('div', 'product-img-wrap');
  const productImg = createElm('img', 'product-img', 'src', dataObj.main_image);

  productImgWrap.append(productImg);
  imgInfoWrap.append(productImgWrap);

  // Create Product Info
  const productInfo = createElm('div', 'product-info');
  const productName = createElm('div', 'product-name');
  productName.innerHTML = dataObj.title;

  const productId = createElm('div', 'product-id');
  productId.innerHTML = dataObj.id;

  const productColor = createElm('div', 'product-color');
  productColor.innerHTML = '顏色｜' + variant.colorName;

  const productSize = createElm('div', 'product-size');
  productSize.innerHTML = '尺寸｜' + variant.size;

  productInfo.append(productName, productId, productColor, productSize);
  imgInfoWrap.append(productInfo);

  // Create Remove Button
  const removeBtnWrap = createElm('div', 'remove-btn-wrap');
  const removeBtn = createElm(
    'img',
    'remove-btn',
    'src',
    '../images/cart-remove.png',
    'product-code',
    variant.productCode
  );

  productItem.append(removeBtnWrap);
  removeBtnWrap.append(removeBtn);

  // Create Order Calculator for Items
  const qtyDiv = createElm('div', 'qty-wrap');
  const qtyLabel = createElm('div', 'list-label');
  qtyLabel.innerHTML = '數量';
  const qtySelect = createElm(
    'select',
    'qty-select',
    'product-code',
    variant.productCode
  );

  for (let i = 1; i <= stock; i++) {
    let qtyOption = createElm('option', null, 'value', i);

    qtyOption.innerHTML = i;
    if (i == variant.qty) {
      qtyOption.setAttribute('selected', 'selected');
    }
    qtySelect.append(qtyOption);
  }
  qtyDiv.append(qtyLabel, qtySelect);

  const priceDiv = createElm('div', 'price-wrap');
  const priceLabel = createElm('div', 'list-label');
  priceLabel.innerHTML = '單價';
  const price = createElm('div', null);
  price.innerHTML = 'NT.' + dataObj.price;
  priceDiv.append(priceLabel, price);

  const subTotalDiv = createElm('div', 'sub-total-wrap');
  const subTotalLabel = createElm('div', 'list-label');
  subTotalLabel.innerHTML = '小計';

  const subTotalWrap = createElm('div', 'sub-total-wrap');
  subTotalWrap.innerHTML = 'NT.';
  const subTotal = createElm('span', 'sub-total');
  subTotal.innerHTML = dataObj.price * qtySelect.value;
  subTotalWrap.append(subTotal);
  subTotalDiv.append(subTotalLabel, subTotalWrap);
  productItem.append(qtyDiv, priceDiv, subTotalDiv);

  // Calculate Total Price
  const subTotals = document.getElementsByClassName('sub-total');
  const totalPriceSpan = document.getElementById('total-price');
  const freightFeeSpan = document.getElementById('freight-fee');
  const finalPriceSpan = document.getElementById('final-price');
  let total = 0;

  for (let i = 0; i < subTotals.length; i++) {
    total += parseInt(subTotals[i].innerHTML);
  }

  totalPriceSpan.innerHTML = total;
  finalPriceSpan.innerHTML = total + parseInt(freightFeeSpan.innerHTML);
};

// Check Cart Data
const checkCart = () => {
  // Clear cart list
  listDiv.innerHTML = '';
  if (Object.keys(cart).length !== 0) {
    Object.keys(cart).forEach(productCode => {
      const selProductDtls = cart[productCode];
      const productId = selProductDtls.id;
      const variant = {
        productCode: productCode,
        id: productId,
        colorName: selProductDtls.color.name,
        colorCode: selProductDtls.color.code,
        size: selProductDtls.size,
        qty: selProductDtls.qty
      };

      getProductDetail(productId, variant, (variant, response) => {
        renderSelProducts(variant, response);
      });
    });
  } else {
    const list = document.querySelector('.list');
    list.innerHTML = '您的購物車內沒有商品，快去選購商品吧！';
  }
  // Store Updated Cart to Local Storage
  localStorage['cart'] = JSON.stringify(cart);
  // Update Cart Badge while qty change
  updateCartBadge();
};

// initial cart list
checkCart();

// Remove from Cart Feature
listDiv.addEventListener('click', e => {
  let targetElement = e.target;
  while (targetElement !== null) {
    if (targetElement.matches('.remove-btn')) {
      let productCode = targetElement.getAttribute('product-code');
      delete cart[productCode];
      checkCart();
    }
    targetElement = targetElement.parentElement;
  }
});

// Quantity Modifying Feature
listDiv.addEventListener('change', e => {
  let targetElement = e.target;

  while (targetElement !== null) {
    if (targetElement.matches('.qty-select')) {
      let productCode = targetElement.getAttribute('product-code');
      cart[productCode].qty = parseInt(
        targetElement.options[targetElement.selectedIndex].value
      );
      checkCart();
    }
    targetElement = targetElement.parentElement;
  }
});

let fbAccessToken = '';
// Get FB Access Token
window.fbAsyncInit = function() {
  FB.init({
    appId: '2496893400594199',
    cookie: true,
    xfbml: true,
    version: 'v5.0'
  });
  fbAccessToken = 'test ';
  const statusChange = response => {
    if (response.status === 'connected') {
      fbAccessToken = response.authResponse.accessToken;
    }
  };

  FB.getLoginStatus(function(response) {
    statusChange(response);
  });
};

// Loading Animation
const showLoader = () => {
  const loader = document.getElementById('loading');
  loader.style.display = 'block';
};

// TapPay

const tapPay = () => {
  const submitButton = document.getElementById('confirm-btn');
  TPDirect.setupSDK(
    12348,
    'app_pa1pQcKoY22IlnSXq5m5WP5jFKzoRG58VEXpT7wU62ud7mMbDOGzCYIlzzLF',
    'sandbox'
  );

  TPDirect.card.setup({
    fields: {
      number: {
        // css selector
        element: '#card-number',
        placeholder: '**** **** **** ****'
      },
      expirationDate: {
        // DOM object
        element: document.getElementById('card-expiration-date'),
        placeholder: 'MM / YY'
      },
      ccv: {
        element: '#card-ccv',
        placeholder: 'ccv'
      }
    },
    styles: {
      // Style all elements
      input: {
        color: 'gray'
      },
      // Styling ccv field
      'input.ccv': {
        'font-size': '16px'
      },
      // Styling expiration-date field
      'input.expiration-date': {
        'font-size': '16px'
      },
      // Styling card-number field
      'input.card-number': {
        'font-size': '16px'
      },
      // style focus state
      ':focus': {
        // 'color': 'black'
      },
      // style valid state
      '.valid': {
        color: 'green'
      },
      // style invalid state
      '.invalid': {
        color: 'red'
      },
      // Media queries
      // Note that these apply to the iframe, not the root window.
      '@media screen and (max-width: 400px)': {
        input: {
          color: 'orange'
        }
      }
    }
  });

  TPDirect.card.onUpdate(function(update) {
    // update.canGetPrime === true
    // --> you can call TPDirect.card.getPrime()
    if (update.canGetPrime) {
      // Enable submit Button to get prime.
      submitButton.removeAttribute('disabled');
    } else {
      // Disable submit Button to get prime.
      submitButton.setAttribute('disabled', true);
    }

    // handle field input
    const numberError = document.getElementById('cc-number-alert');
    const expError = document.getElementById('cc-exp-alert');
    const ccvError = document.getElementById('ccv-alert');
    if (update.status.number === 2) {
      numberError.style.display = 'block';
    } else if (update.status.number === 0) {
      numberError.style.display = 'none';
    } else {
      numberError.style.display = 'none';
    }

    if (update.status.expiry === 2) {
      expError.style.display = 'block';
    } else if (update.status.expiry === 0) {
      expError.style.display = 'none';
    } else {
      expError.style.display = 'none';
    }

    if (update.status.ccv === 2) {
      ccvError.style.display = 'block';
    } else if (update.status.ccv === 0) {
      ccvError.style.display = 'none';
    } else {
      ccvError.style.display = 'none';
    }
  });

  submitButton.addEventListener('click', () => {
    const totalPrice = document.getElementById('total-price');
    const freightFee = document.getElementById('freight-fee');
    const finalPrice = document.getElementById('final-price');
    const recipientName = document.getElementById('name-input');
    const recipientPhone = document.getElementById('phone-input');
    const recipientEmail = document.getElementById('email-input');
    const recipientAddress = document.getElementById('address-input');
    const timePrefer = document.querySelector('input[name="prefer-time"]:checked').value;

    // 取得 TapPay Fields 的 status
    const tappayStatus = TPDirect.card.getTappayFieldsStatus();

    // Data Validation

    if (Object.keys(cart).length === 0) {
      alert('您的購物車內沒有商品喔！快去選購商品吧！');
    } else if (!recipientName.value) {
      alert('請輸入訂購人姓名');
    } else if (!recipientPhone.value) {
      ('請輸入訂購人電話');
    } else if (!recipientEmail.value) {
      ('請輸入訂購人Email');
    } else if (!recipientAddress.value) {
      ('請輸入訂購地址');
    } else if (tappayStatus.canGetPrime === false) {
      alert('請確實輸入信用卡資訊');
      return;
    } else {
      showLoader();
      // Get prime
      TPDirect.card.getPrime(result => {
        if (result.status !== 0) {
          alert('信用卡付款失敗，請洽您的信用卡公司' + result.msg);
        } else {
          // Compose Submit Data
          let cartList = Object.values(cart);
          let submitData = {
            prime: result.card.prime,
            order: {
              shipping: 'delivery',
              payment: 'credit_card',
              subtotal: parseInt(totalPrice.innerHTML),
              freight: parseInt(freightFee.innerHTML),
              total: parseInt(finalPrice.innerHTML),
              recipient: {
                name: recipientName.value,
                phone: recipientPhone.value,
                email: recipientEmail.value,
                address: recipientAddress.value,
                time: timePrefer
              },
              list: cartList
            }
          };

          // POST Submit Data
          const postOrderData = () => {
            const xhr = new XMLHttpRequest();
            let url = host + '/api/1.0/order/checkout';

            xhr.open('POST', url);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('Authorization', `Bearer ${fbAccessToken}`);
            xhr.onreadystatechange = () => {
              if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                  localStorage.removeItem('cart');
                  getLocalStorage();
                  checkCart();
                  const orderNumber = JSON.parse(xhr.responseText).data.number;
                  window.location.replace(`./thank.html?order=${orderNumber}`);
                } else {
                  alert(`[${xhr.status}] ${xhr.statusText}`);
                }
              }
            };
            xhr.send(JSON.stringify(submitData));
          };
          postOrderData();
        }
      });
    }
  });
};
tapPay();
