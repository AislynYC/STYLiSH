const host = 'https://api.appworks-school.tw';
let query = window.location.search.substring(1);
const mainInfo = document.getElementsByClassName('main-info-area')[0];
const subInfo = document.getElementsByClassName('sub-info-area')[0];
const addToCartBtn = document.getElementsByClassName('add-to-cart-btn')[0];
const cartQtyWeb = document.getElementsByClassName('cart-qty')[0];
const cartQtyMobile = document.getElementsByClassName('cart-qty')[1];
let cart;

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

// Get Product Details
const getProductDetail = callback => {
  const xhr = new XMLHttpRequest();
  let url = host + '/api/1.0/products/details?' + query;

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

// Render Product Details to Product Page
const renderProductPage = data => {
  const productDtls = JSON.parse(data).data;

  // ======== Main Info Rendering ========

  // Product Main Picture Rendering
  const mainImgArea = document.getElementsByClassName('product-main-img-area')[0];
  const mainImg = document.createElement('img');
  mainImg.className = 'product-main-img';
  mainImg.setAttribute('src', productDtls.main_image);
  mainImgArea.appendChild(mainImg);

  // Product Id Rendering
  const productId = document.createElement('div');
  productId.className = 'product-id';
  productId.innerHTML = productDtls.id;
  mainInfo.prepend(productId);

  // Product Name Rendering
  const productName = document.createElement('div');
  productName.className = 'product-name';
  productName.innerHTML = productDtls.title;
  mainInfo.prepend(productName);

  // Product Price Rendering
  const productPrice = document.getElementsByClassName('product-price')[0];
  productPrice.innerHTML = 'TWD.' + productDtls.price;

  // Check Stock by Color and Size
  const variants = productDtls.variants;
  const checkColorStock = color => {
    const sizeOfSameColor = variants.filter(item => {
      return item.color_code === color;
    });
    let stockOfSameColor = 0;
    sizeOfSameColor.forEach(item => {
      stockOfSameColor += item.stock;
    });
    if (stockOfSameColor !== 0) {
      return true;
    } else {
      return false;
    }
  };

  const checkVariantStock = (color, size) => {
    const variant = variants.find(item => {
      return item.color_code === color && item.size === size;
    });
    return variant.stock;
  };

  // Color Boxes rendering
  const colorOption = document.querySelector('.color-area>.options');

  const createColorBox = color => {
    const colorDiv = document.createElement('div');
    colorDiv.className = 'color-box';
    colorDiv.title = color.name;
    colorDiv.style.backgroundColor = '#' + color.code;
    colorDiv.setAttribute('code', color.code);
    colorOption.appendChild(colorDiv);
  };
  const drawColorBox = item => {
    item.colors.forEach(color => {
      if (checkColorStock(color.code) === true) {
        createColorBox(color);
      } else {
        createColorBox(color);
        const newestColorBox = document.querySelector('.color-box:last-child');
        newestColorBox.classList.add('out-of-stock');
      }
    });
  };
  drawColorBox(productDtls);

  const colorBoxes = colorOption.children;
  const colorBoxesArray = [].slice.call(colorBoxes);
  // Color Box Active & Inactive
  // --- set default selection
  for (let i = 0; i < colorBoxesArray.length; i++) {
    if (checkColorStock(colorBoxesArray[i].attributes.code.value) === true) {
      colorBoxesArray[i].classList.add('active');
      break;
    }
  }
  // --- set active selection after clicking
  colorOption.addEventListener(
    'click',
    e => {
      let target = e.target;
      if (target.matches('.color-box') && !target.matches('.out-of-stock')) {
        for (let i = 0; i < colorBoxesArray.length; i++) {
          colorBoxesArray[i].classList.remove('active');
        }
        target.classList.add('active');
      }
      for (let i = 0; i < sizeBoxesArray.length; i++) {
        sizeBoxesArray[i].classList.remove('active');
      }
      for (let i = 0; i < sizeBoxesArray.length; i++) {
        const activeColor = document.querySelector('.color-area>.options>.active');

        if (
          checkVariantStock(
            activeColor.attributes.code.value,
            sizeBoxesArray[i].attributes.code.value
          ) !== 0
        ) {
          sizeBoxesArray[i].classList.add('active');
          break;
        }
      }

      // --- reset to default qty while switching focus of color option
      resetQtyPanel();
      // --- update size out of stock while switching focus of color option
      sizeBoxesArray.forEach(size => {
        const activeColor = document.querySelector('.color-area>.options>.active');
        size.classList.remove('out-of-stock');
        if (
          checkVariantStock(
            activeColor.attributes.code.value,
            size.attributes.code.value
          ) === 0
        ) {
          size.classList.add('out-of-stock');
        }
      });
    },
    true
  );

  // Size Boxes Rendering
  const sizeOption = document.querySelector('.size-area>.options');

  const createSizeBox = size => {
    const sizeDiv = document.createElement('div');
    sizeDiv.className = 'size-box';
    sizeDiv.setAttribute('code', size);
    sizeDiv.innerHTML = size;
    sizeOption.appendChild(sizeDiv);
  };

  const drawSizeBox = item => {
    const activeColor = document.querySelector('.color-area>.options>.active');
    item.sizes.forEach(size => {
      createSizeBox(size);
      if (checkVariantStock(activeColor.attributes.code.value, size) === 0) {
        const newestSizeBox = document.querySelector('.size-box:last-child');
        newestSizeBox.classList.add('out-of-stock');
      }
    });
  };
  drawSizeBox(productDtls);

  const sizeBoxes = sizeOption.children;
  const sizeBoxesArray = [].slice.call(sizeBoxes);
  // Size Box Active & Inactive
  // --- set default selection
  for (let i = 0; i < sizeBoxesArray.length; i++) {
    const activeColor = document.querySelector('.color-area>.options>.active');
    if (
      checkVariantStock(
        activeColor.attributes.code.value,
        sizeBoxesArray[i].attributes.code.value
      ) !== 0
    ) {
      sizeBoxesArray[i].classList.add('active');
      break;
    }
  }
  // --- set active selection after clicking
  sizeOption.addEventListener(
    'click',
    e => {
      let target = e.target;
      if (target.matches('.size-box') && !target.matches('.out-of-stock')) {
        for (let i = 0; i < sizeBoxesArray.length; i++) {
          sizeBoxesArray[i].classList.remove('active');
        }
        target.classList.add('active');
      }
      resetQtyPanel();
    },
    true
  );

  // Reset quantity number to 1 and
  // change quantity limitation according to available stock
  const qtyNumber = document.getElementById('qty-number');
  let availableStock = 0;
  let orderQty = 1;
  const resetQtyPanel = () => {
    // Reset available quantity according to available stock
    const activeColor = document.querySelector('.color-area>.options>.active');
    const activeSize = document.querySelector('.size-area>.options>.active');
    availableStock = checkVariantStock(
      activeColor.attributes.code.value,
      activeSize.attributes.code.value
    );

    // --- set default value
    orderQty = 1;
    qtyNumber.innerHTML = orderQty;
  };
  resetQtyPanel();

  // Plus and Minus Button for ordering

  const minusBtn = document.getElementById('qty-minus-btn');
  const plusBtn = document.getElementById('qty-plus-btn');

  const qtyController = () => {
    // --- click event for Minus button

    minusBtn.addEventListener('click', () => {
      orderQty--;
      if (orderQty <= 1) {
        orderQty = 1;
      }
      qtyNumber.innerHTML = orderQty;
    });
    // --- click event for Plus button
    plusBtn.addEventListener('click', () => {
      orderQty++;
      if (orderQty > availableStock) {
        orderQty = availableStock;
      }
      qtyNumber.innerHTML = orderQty;
    });
  };

  qtyController();

  // According to Available Stock
  // colorBoxesArray.forEach(item => {
  //   item.addEventListener('click', () => {
  //     const activeColor = document.querySelector('.color-area>.options>.active');

  //   });
  // });

  // Product Description Rendering
  const descDiv = document.getElementsByClassName('desc')[0];
  const descDescription = productDtls.description.replace(/\s+/g, '<br />');
  let template = `<div class="desc-note">${productDtls.note}</div>
                <br />
                <div class="desc-texture">${productDtls.texture}</div>
                <div class="desc-description">${descDescription}</div>
                <br />
                <div class="desc-wash">清洗：${productDtls.wash}</div>
                <div class="desc-place">產地：${productDtls.place}</div>`;
  descDiv.innerHTML = template;

  // ======== Sub Info Rendering ========

  // Sub Info Story Rendering
  const subStory = document.createElement('div');
  subStory.className = 'sub-info-story';
  subStory.innerHTML = productDtls.story;
  subInfo.appendChild(subStory);

  // Sub Image Rendering
  const subImgs = productDtls.images;

  const subImgArea = document.createElement('div');
  subImgArea.className = 'sub-img-area';

  subImgs.forEach(item => {
    const subImgWrap = document.createElement('div');
    subImgWrap.className = 'product-sub-img-wrap';

    const subImg = document.createElement('img');
    subImg.className = 'product-sub-img';
    subImg.setAttribute('src', item);
    subImgWrap.appendChild(subImg);
    subImgArea.appendChild(subImgWrap);
    subInfo.appendChild(subImgArea);
  });
};

const addToCart = data => {
  const productDtls = JSON.parse(data).data;
  // Check Stock
  const variants = productDtls.variants;
  const checkVariantStock = (color, size) => {
    const variant = variants.find(item => {
      return item.color_code === color && item.size === size;
    });
    return variant.stock;
  };
  // Add to Cart Clicking event
  addToCartBtn.addEventListener('click', () => {
    const qtyNumber = document.getElementById('qty-number');
    const activeColorCode = document.querySelector('.color-area>.options>.active')
      .attributes.code.value;
    const activeColorTitle = document.querySelector('.color-area>.options>.active')
      .attributes.title.value;
    const activeSizeCode = document.querySelector('.size-area>.options>.active')
      .attributes.code.value;
    let productCode = productDtls.id + activeColorCode + activeSizeCode;

    if (cart[productCode] === undefined) {
      cart[productCode] = {
        id: String(productDtls.id),
        name: productDtls.title,
        price: productDtls.price,
        color: {
          name: activeColorTitle,
          code: activeColorCode
        },
        size: activeSizeCode,
        qty: parseInt(qtyNumber.innerHTML)
      };
    } else {
      cart[productCode].qty += parseInt(qtyNumber.innerHTML);
      // if order quantity more than stock quantity, make the order quantity equal to stock quantity
      if (cart[productCode].qty > checkVariantStock(activeColorCode, activeSizeCode)) {
        cart[productCode].qty = checkVariantStock(activeColorCode, activeSizeCode);
      }
    }
    // Store Add To Cart Data to LocalStorage
    localStorage['cart'] = JSON.stringify(cart);
    updateCartBadge();
  });
};

getProductDetail(response => {
  renderProductPage(response);
  addToCart(response);
});
