let query = window.location.search.substring(1);
let orderNumber = query.split('=')[1];
const cartQtyWeb = document.getElementsByClassName('cart-qty')[0];
const cartQtyMobile = document.getElementsByClassName('cart-qty')[1];

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
  let cartCount = 0;

  for (let [key, value] of Object.entries(cart)) {
    cartCount += parseInt(value.qty);
  }

  cartQtyWeb.innerHTML = cartCount;
  cartQtyMobile.innerHTML = cartCount;
};
updateCartBadge();

// Show order Number
const orderNum = document.getElementById('order-number');
orderNum.innerHTML = orderNumber;

// Continue Button
const continueBtn = document.getElementById('continue-btn');
continueBtn.addEventListener('click', () => {
  window.location.replace('../index.html');
});
