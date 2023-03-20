// Get the tab elements
const tabHeaders = document.querySelectorAll('.tab-header');
const tabContents = document.querySelectorAll('.tab-content');

// Hide all tab contents
for (let j = 0; j < tabContents.length; j++) {
    tabContents[j].classList.remove('active');
}

// Get the initial tab header
let activeTab = document.querySelector('.tab-header.active');
let initialTab = activeTab ? activeTab.dataset.tab : '';

// Show the initial tab content
for (let j = 0; j < tabContents.length; j++) {
    if (tabContents[j].dataset.tab === initialTab) {
        tabContents[j].classList.add('active');
    }
}

// Add click event listeners to the tab headers
for (let i = 0; i < tabHeaders.length; i++) {
    tabHeaders[i].addEventListener('click', () => {
        // Hide all tab contents
        for (let j = 0; j < tabContents.length; j++) {
            tabContents[j].classList.remove('active');
        }

        // Remove the 'active' class from all tab headers
        for (let j = 0; j < tabHeaders.length; j++) {
            tabHeaders[j].classList.remove('active');
        }

        // Show the selected tab content
        tabContents[i].classList.add('active');

        // Add the 'active' class to the selected tab header
        tabHeaders[i].classList.add('active');
    });
}

// Change quantity
// get the necessary elements
const quantityInput = document.getElementById("product-quantity");
const priceElement = document.getElementById("product-price-value");
const price = parseFloat(removeNonNumeric(priceElement.innerText));
const quantityUpBtn = document.getElementById("quantity-up");
const quantityDownBtn = document.getElementById("quantity-down");
const maxQuantity = parseInt(removeNonNumeric(document.getElementById("in-stock-quantity").innerHTML));

// add event listener to quantity-up button
quantityUpBtn.addEventListener("click", function() {
    let quantity = parseInt(removeNonNumeric(quantityInput.value));
    if (quantity < maxQuantity) {
        quantity++;
        quantityInput.value = quantity;
        priceElement.innerText = separateThousands((price * quantity).toFixed(0));
    }
});

// add event listener to quantity-down button
quantityDownBtn.addEventListener("click", function() {
    let quantity = parseInt(removeNonNumeric(quantityInput.value));
    if (quantity > 1) {
        quantity--;
        quantityInput.value = quantity;
        priceElement.innerText = separateThousands((price * quantity).toFixed(0));
    }
});

// Order event
let orderArr = [];
let orderBill = {
    billCode: "",
    billValue: 0
};

// Hide all modals function
function hideAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}


// Add-to-cart event
const addToCartBtn = document.getElementById("product-add-to-cart");
const cartIcon = document.getElementById("shopping-cart-icon");
const viewCartBtn = document.getElementById("view-cart-btn");
const continueShopBtn = document.getElementById("continue-shopping-btn");

viewCartBtn.addEventListener("click", function() {
    updateCart();
    cartModal.style.display = "block";
});

continueShopBtn.addEventListener("click", function() {
    document.getElementById('notification').style.display = 'none';
});

addToCartBtn.addEventListener("click", function() {
    addRedDot();
    getOrderObj();
    document.getElementById('notification').style.display = 'block';
});

function addRedDot() {
    const redDot = document.createElement("span");
    redDot.classList.add("red-dot");
    cartIcon.appendChild(redDot);
}

// Back-to-cart event
var backToCartBtn = document.getElementById("back-to-cart");
backToCartBtn.onclick = function() {
    hideAllModals();
    updateCart();
    cartModal.style.display = "block";
}


// Get the modal
var cartModal = document.getElementById("cart-modal");

// Get the shopping cart icon
var shoppingCartIcon = document.getElementById("shopping-cart-icon");

// When the shopping cart icon is clicked, show the cart modal
shoppingCartIcon.onclick = function() {
    updateCart();
    // Hide other modals if any
    // ...

    cartModal.style.display = "block";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == cartModal) {
        cartModal.style.display = "none";
    }
}

// Get the <span> element that closes the modal
const closeXButton = document.querySelectorAll('.close');
closeXButton.forEach((btn) => {
    btn.addEventListener('click', () => {
        const modal = btn.closest('.modal');
        modal.style.display = 'none';
    });
});
const closeButton = document.querySelectorAll('.btn-close');
closeButton.forEach((btn) => {
    btn.addEventListener('click', () => {
        const modal = btn.closest('.modal');
        modal.style.display = 'none';
    });
});

const productBuyNowBtn = document.getElementById('product-buy-now');
const btnPaymentOpen = document.getElementById('btn-payment-open');
const paymentModal = document.getElementById('paymentModal');
const backdrop = document.getElementById('backdrop');

// Add event listeners to productBuyNowBtn and btnPaymentOpen
productBuyNowBtn.addEventListener('click', function() {
    addRedDot();
    getOrderObj();
});
productBuyNowBtn.addEventListener('click', function() {
    createBill();
    openPaymentModal();
});
btnPaymentOpen.addEventListener('click', function() {
    createBill();
    openPaymentModal();
});

function openPaymentModal() {
    // Update bill code
    document.getElementById("bill-code").innerHTML = orderBill.billCode;
    document.getElementById("bill-code-2").innerHTML = orderBill.billCode;
    // Update bill money
    document.getElementById("payment-money").innerHTML = separateThousands(orderBill.billValue);
    document.getElementById("payment-money-2").innerHTML = separateThousands(orderBill.billValue);
    // Update bill money spell
    document.getElementById("payment-money-spell").innerHTML = spellGen();
    document.getElementById("payment-money-spell-2").innerHTML = spellGen();

    // Hide cart modal
    cartModal.style.display = 'none';

    // Show payment modal
    paymentModal.style.display = 'block';
    //backdrop.style.display = 'block';
}

function getOrderObj() {
    const productCode = document.getElementById("product-code").innerHTML;
    const productQuantity = parseInt(removeNonNumeric(document.getElementById("product-quantity").value));
    const productPrice = parseFloat(removeNonNumeric(document.getElementById("product-price-value").innerHTML)).toFixed(0) / productQuantity;

    if (orderArr.length == 0) {
        orderArr.push({
            orderId: orderArr.length + 1,
            orderDetails: {
                code: productCode,
                quantity: productQuantity,
                price: productPrice
            }
        });
    } else {
        for (var i = 0; i < orderArr.length; i++) {
            if (orderArr[i].orderDetails.code != productCode) {
                orderArr.push({
                    orderId: orderArr.length + 1,
                    orderDetails: {
                        code: productCode,
                        quantity: productQuantity,
                        price: productPrice
                    }
                });
            } else {
                orderArr[i].orderDetails.quantity += productQuantity;
            }
        }
    }

    updateBill();
}

// Filling order table
function fillOrdersTable(ordersArray) {
    // Get the table element and clear its contents
    const table = document.getElementById('orders-table');
    table.innerHTML = '';

    if (ordersArray.length == 0) table.innerHTML = 'Giỏ hàng đang trống';
    else {
        // Create a table header row
        const headerRow = document.createElement('tr');
        const headers = ['STT', 'Mã sản phẩm', 'Số lượng', 'Giá', 'Thành tiền', ''];
        headers.forEach(headerText => {
            const header = document.createElement('th');
            header.textContent = headerText;
            headerRow.appendChild(header);
        });
        table.appendChild(headerRow);

        // Loop through the orders array and create a row for each one
        for (var i = 0; i < ordersArray.length; i++) {
            const row = document.createElement('tr');

            // Create a cell for the STT
            const sttCell = document.createElement('td');
            sttCell.textContent = ordersArray[i].orderId;
            row.appendChild(sttCell);

            // Create a cell for the product code
            const codeCell = document.createElement('td');
            codeCell.textContent = ordersArray[i].orderDetails.code;
            row.appendChild(codeCell);

            // Create a cell for the quantity
            const quantCell = document.createElement('td');
            const quantCellInnerGroup = document.createElement('div');
            quantCellInnerGroup.classList.add('product-quantity-group');
            quantCellInnerGroup.setAttribute('id', 'cart-quantity-' + ordersArray[i].orderDetails.code);

            // Create a number input element
            const quantityInput = document.createElement("input");
            quantityInput.type = "text";
            quantityInput.min = 1;
            quantityInput.value = ordersArray[i].orderDetails.quantity;
            quantityInput.classList.add("product-quantity");

            // Create a div element for the quantity buttons
            const quantityBtns = document.createElement("div");
            quantityBtns.classList.add("quantity-btns");

            // Create the quantity-up button
            const quantityUpBtn = document.createElement("button");
            quantityUpBtn.classList.add("quantity-btn", "quantity-up");
            quantityUpBtn.setAttribute('id', 'quantity-btn-up-' + ordersArray[i].orderDetails.code);
            quantityUpBtn.setAttribute('onclick', 'quantityChange("' + ordersArray[i].orderDetails.code + '",1)');
            quantityUpBtn.innerHTML = "+";

            // Create the quantity-down button
            const quantityDownBtn = document.createElement("button");
            quantityDownBtn.classList.add("quantity-btn", "quantity-down");
            quantityDownBtn.setAttribute('id', 'quantity-btn-down-' + ordersArray[i].orderDetails.code);
            quantityDownBtn.setAttribute('onclick', 'quantityChange("' + ordersArray[i].orderDetails.code + '",-1)');
            quantityDownBtn.innerHTML = "-";

            // Append the quantity buttons to the quantityBtns div
            quantityBtns.appendChild(quantityUpBtn);
            quantityBtns.appendChild(quantityDownBtn);

            // Append the quantity input and quantity buttons to the cart-quantity element
            quantCellInnerGroup.appendChild(quantityInput);
            quantCellInnerGroup.appendChild(quantityBtns);


            quantCell.appendChild(quantCellInnerGroup);
            //quantCell.textContent = ordersArray[i].orderDetails.quantity;
            row.appendChild(quantCell);

            // Create a cell for the price
            const priceCell = document.createElement('td');
            priceCell.textContent = separateThousands(ordersArray[i].orderDetails.price);
            row.appendChild(priceCell);

            // Create a cell for the single product value
            const costCell = document.createElement('td');
            costCell.textContent = separateThousands(ordersArray[i].orderDetails.price * ordersArray[i].orderDetails.quantity);
            row.appendChild(costCell);

            // Create a cell for the remove icon
            const removeCell = document.createElement('td');
            const removeIcon = document.createElement('i');
            removeIcon.classList.add('fas', 'fa-trash-alt', 'remove-product-icon');
            removeIcon.setAttribute('id', 'remove-' + ordersArray[i].orderDetails.code);
            removeIcon.setAttribute('onclick', 'removeProduct("' + ordersArray[i].orderDetails.code + '")');
            removeIcon.setAttribute('data-index', i);
            removeCell.appendChild(removeIcon);
            row.appendChild(removeCell);

            table.appendChild(row);
        }
    }
}

function updateCart() {
    fillOrdersTable(orderArr);
    document.getElementById('cart-payment-total').innerHTML = separateThousands(orderBill.billValue);
}

function spellGen() {
    if (orderBill.billValue > 0) return intToVietnameseSpelling(orderBill.billValue).charAt(0).toUpperCase() + intToVietnameseSpelling(orderBill.billValue).slice(1);
    else return "Không";
}

function intToVietnameseSpelling(num) {
    const ones = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
    const tenToNineteen = ['mười', 'mười một', 'mười hai', 'mười ba', 'mười bốn', 'mười lăm', 'mười sáu', 'mười bảy', 'mười tám', 'mười chín'];
    const tens = ['', 'mười', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];

    let result = '';

    if (num === 0) {
        result = '';
    } else if (num >= 1000000000) {
        result = intToVietnameseSpelling(Math.floor(num / 1000000000)) + ' tỷ ' + intToVietnameseSpelling(num % 1000000000);
    } else if (num >= 1000000) {
        result = intToVietnameseSpelling(Math.floor(num / 1000000)) + ' triệu ' + intToVietnameseSpelling(num % 1000000);
    } else if (num >= 1000) {
        result = intToVietnameseSpelling(Math.floor(num / 1000)) + ' nghìn ' + intToVietnameseSpelling(num % 1000);
    } else if (num >= 100) {
        result = ones[Math.floor(num / 100)] + ' trăm ' + intToVietnameseSpelling(num % 100);
    } else if (num >= 20) {
        result = tens[Math.floor(num / 10)] + ' ' + ones[num % 10];
    } else if (num >= 10) {
        result = tenToNineteen[num % 10];
    } else {
        result = ones[num];
    }

    return result;
}


function createBill() {
    const randomLetters = [...Array(5)].map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
    const timestamp = Math.floor(Date.now() / 1000);
    const orderID = `${randomLetters}${timestamp}`;
    orderBill.billCode = orderID;
}

function updateBill() {
    let billValue = 0;
    for (var i = 0; i < orderArr.length; i++) {
        billValue += orderArr[i].orderDetails.quantity * orderArr[i].orderDetails.price;
    }
    orderBill.billValue = billValue;
}

// Remove product from order array
function removeProduct(id) {
    if (orderArr.length > 0) {
        for (var i = 0; i < orderArr.length; i++) {
            if (orderArr[i].orderDetails.code == id) {
                orderArr.splice(i, 1);
                // Update cart table
                fillOrdersTable(orderArr);
                // Update bill
                updateBill();
                // Update cart
                updateCart();
            }
        }
    }
}

// Change product quantity in order array
function quantityChange(id, num) {
    if (orderArr.length > 0) {
        for (var i = 0; i < orderArr.length; i++) {
            if (orderArr[i].orderDetails.code == id) {
                orderArr[i].orderDetails.quantity += num;
                if (orderArr[i].orderDetails.quantity < 0) orderArr[i].orderDetails.quantity = 0;
                // Update cart table
                fillOrdersTable(orderArr);
                // Update bill
                updateBill();
                // Update cart
                updateCart();
            }
        }
    }
}

function removeNonNumeric(str) {
    return str.replace(/\D/g, '');
}

function separateThousands(num) {
    return Number(num).toLocaleString('vi-VN');
}

// Submit order to server
document.getElementById('shop-done-btn').addEventListener('click', function() {
    fetch('/api/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                orderArr: orderArr,
                orderBill: orderBill
            })
        })
        .then(response => response.json())
        .then(data => {
            const serverMessageSuccess = document.getElementById('server-message-success');
            const serverMessageError = document.getElementById('server-message-error');
            console.log(data); // do something with the response data
            if (data.error == 0) {
                serverMessageSuccess.innerHTML = '<p>Đơn hàng đang được xử lý. Chúng tôi sẽ liên hệ lại với bạn.</p>';
                serverMessageSuccess.style.display = 'block';
            } else {
                serverMessageError.innerHTML = '<p>Rất tiếc, đã có lỗi xảy ra: ' + data.message +'</p>';
                serverMessageError.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
});
