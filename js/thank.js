let query = window.location.search.substring(1);
let orderNumber = query.split('=')[1];

// Show order Number
const orderNum = document.getElementById('order-number');
orderNum.innerHTML = orderNumber;

// Continue Button
const continueBtn = document.getElementById('continue-btn');
continueBtn.addEventListener('click', () => {
  window.location.replace('../index.html');
});
