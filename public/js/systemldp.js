document.addEventListener("DOMContentLoaded", function() {
    var btn1 = document.getElementById("btn1");
    var btn2 = document.getElementById("btn2");
    var btn3 = document.getElementById("btn3");
    var section1 = document.getElementById("section1");
    var section2 = document.getElementById("section2");
    var section3 = document.getElementById("section3");

    section2.style.display = "none";
    //section3.style.display = "none";

    btn1.addEventListener("click", function() {
        section1.style.display = "none";
        section2.style.display = "flex";
        fadeInSection("section2");
    });

    /*btn2.addEventListener("click", function() {
        section1.style.display = "none";
        section2.style.display = "none";
        section3.style.display = "block";
        fadeInSection("section3");
    });*/

    btn2.addEventListener("click", function() {
        var modal = document.getElementById("myModal");
        modal.style.display = "flex";
        fadeInSection("myModal");
    });

    // Get all elements with class "close"
    const closeButtons = document.querySelectorAll('.close');

    // Add click event listener to each "close" button
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Get all modals and hide them
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });

    window.addEventListener("click", function(event) {
        var modal = document.getElementById("myModal");
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });
});

function fadeInSection(sectionId) {
    let section = document.getElementById(sectionId);
    let elements = section.getElementsByTagName("*");
    let delay = 0;
    for (let i = 0; i < elements.length; i++) {
        let element = elements[i];
        if (window.getComputedStyle(element).getPropertyValue("display") === "none") {
            if (!element.classList.contains('noautoani')) {
                element.style.display = "block";
                element.style.opacity = 0;
                element.style.transition = "opacity 1s ease " + delay + "s";
                delay += 0.2;
                setTimeout(function() {
                    element.style.opacity = 1;
                }, 50 + (i * 200));
            }
        }
    }
    setSectionImageHeight(sectionId);
}

// automatic image height
function setSectionImageHeight(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    section.style.height = '100vh';
    const sectionHeight = section.clientHeight;
    console.log('Section height: ' + sectionHeight);
    const sectionContent = section.querySelectorAll(':not(img)');
    let sectionContentHeight = 0;
    sectionContent.forEach((elem) => {
        sectionContentHeight += elem.offsetHeight;
    });

    const image = section.querySelector('img');
    if (image) {
        const imageHeight = sectionHeight - sectionContentHeight;
        image.style.height = imageHeight + 'px';
    }
}

// Set up an object to store order information
let orderInfo = {
    name: "",
    email: "",
    phone: "",
    product: "",
    orderAmount: 0,
    price: 4000000,
    orderID: "",
    orderConfirm: false
};

function updateTotalMoneyAmount() {
    const orderAmount = document.getElementById("order-amount");
    const totalOrderMoney = document.getElementById("totalOrderMoney");

    // Check if orderAmount value is blank
    if (orderAmount.value === "") {
        totalOrderMoney.innerText = "0";
        return;
    }

    const price = orderInfo.price;
    const quantity = parseFloat(orderAmount.value);
    const total = isNaN(quantity) ? 0 : price * quantity;

    totalOrderMoney.innerText = total.toFixed(0) + " đồng";
}

document.addEventListener("DOMContentLoaded", function() {
    // Add event listener to order amount input field
    const orderAmount = document.getElementById("order-amount");
    orderAmount.addEventListener("input", updateTotalMoneyAmount);
});

const cartIcon = document.querySelector('.cart-icon');
const cartModal = document.getElementById('cart-modal');

cartIcon.addEventListener('click', () => {
    // Hide all other modals
    const modals = document.querySelectorAll('.modal');
    modals.forEach((modal) => {
        if (modal !== cartModal) {
            modal.style.display = 'none';
        }
    });

    // Show cart modal
    cartModal.style.display = 'flex';
});


// Add an event listener to the submit button in the modal
let submitButton = document.querySelector("#submit-button");
submitButton.addEventListener("click", function() {
    // Get the input values and fill the orderInfo object
    orderInfo.name = document.querySelector("#myModal input[name='name']").value;
    orderInfo.email = document.querySelector("#myModal input[name='email']").value;
    orderInfo.phone = document.querySelector("#myModal input[name='phone']").value;
    orderInfo.product = document.querySelector("#myModal input[name='product']").value;
    orderInfo.orderAmount = document.querySelector("#myModal input[name='order-amount']").value;
    orderInfo.orderID = generateOrderID(orderInfo);
    document.getElementById('myModal').style.display = 'none';
    updateCartIcon();
});

// Add an event listener to the shopping cart icon
cartIcon.addEventListener("click", function() {
    // Get the cart-info element and fill it with data from the orderInfo object
    let cartInfo = document.querySelector("#cart-info");
    const orderAmount = orderInfo.orderAmount;
    if (orderAmount > 0) {
        cartInfo.innerHTML = "";
        const cartTitle1 = document.createElement("p");
        cartTitle1.classList.add("font-weight-bold");
        cartInfo.appendChild(cartTitle1);
        cartTitle1.innerHTML = "Thông tin đơn hàng";

        const cartCode = document.createElement("p");
        cartInfo.appendChild(cartCode);
        const cartProduct = document.createElement("p");
        cartInfo.appendChild(cartProduct);
        const cartAmount = document.createElement("p");
        cartInfo.appendChild(cartAmount);

        cartCode.innerHTML = "Mã đơn hàng: " + orderInfo.orderID;
        cartProduct.innerHTML = "Sản phẩm: " + orderInfo.product;
        cartAmount.innerHTML = "Thời gian sử dụng: " + orderInfo.orderAmount + " tháng";

        const cartTitle2 = document.createElement("p");
        cartTitle2.classList.add("font-weight-bold");
        cartInfo.appendChild(cartTitle2);
        cartTitle2.innerHTML = "Thông tin khách hàng";

        const cartName = document.createElement("p");
        cartInfo.appendChild(cartName);
        const cartEmail = document.createElement("p");
        cartInfo.appendChild(cartEmail);
        const cartPhone = document.createElement("p");
        cartInfo.appendChild(cartPhone);

        cartName.innerHTML = "Họ và tên: " + orderInfo.name;
        cartEmail.innerHTML = "Email: " + orderInfo.email;
        cartPhone.innerHTML = "Điện thoại: " + orderInfo.phone;

        const cartButtonContainer = document.createElement("div");
        cartButtonContainer.classList.add("row");
        cartInfo.appendChild(cartButtonContainer);
        const cartButtonAccept = document.createElement("div");
        cartButtonAccept.classList.add("col-6");
        cartButtonContainer.appendChild(cartButtonAccept);
        cartButtonAccept.innerHTML = "<div class='btn' id='cart-accept' onclick='showPeymentModal()'>Thanh toán đơn hàng</div>";
        const cartButtonCancel = document.createElement("div");
        cartButtonCancel.classList.add("col-6");
        cartButtonContainer.appendChild(cartButtonCancel);
        cartButtonCancel.innerHTML = "<div class='btn' id='cart-cancel'>Hủy đơn hàng</div>";

    } else {
        cartInfo.innerHTML = "<p class='text-center font-italic'>Giỏ hàng đang trống</p>";
    }
});

function updateCartIcon() {
    const orderAmount = orderInfo.orderAmount;
    const cartIcon = document.querySelector(".cart-icon");

    if (orderAmount > 0) {
        const dot = document.createElement("div");
        dot.classList.add("cart-dot");
        cartIcon.appendChild(dot);
    } else {
        const dot = cartIcon.querySelector(".cart-dot");
        if (dot) {
            cartIcon.removeChild(dot);
        }
    }
}

function generateOrderID(orderInfo) {
    const randomLetters = [...Array(3)].map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
    const firstLetter = orderInfo.name.charAt(0).toUpperCase();
    const lastLetter = orderInfo.name.charAt(orderInfo.name.length - 1).toUpperCase();
    const lastDigits = orderInfo.phone.slice(-3);
    const timestamp = Math.floor(Date.now() / 1000);
    const orderID = `${randomLetters}${firstLetter}${lastLetter}${lastDigits}${timestamp}`;
    orderInfo.orderID = orderID;
    return orderID;
}

let cartAccept = document.getElementById('cart-accept');
let paymentModal = document.getElementById('payment-modal');

function showPeymentModal() {
    // Hide all other modals
    const modals = document.querySelectorAll('.modal');
    modals.forEach((modal) => {
        modal.style.display = 'none';
    });

    if (paymentModal) {
        const paymentAmount = orderInfo.price * orderInfo.orderAmount;
        document.getElementById('payment-amount').innerHTML = paymentAmount;
        document.getElementById('payment-amount-spell').innerHTML = "(" + intToVietnameseSpelling(paymentAmount) + " đồng)";
        document.getElementById('payment-note').innerHTML = "Thanh toan don hang " + orderInfo.orderID;
        paymentModal.style.display = 'flex';
    }
}

function intToVietnameseSpelling(num) {
    const ones = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
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

    return result.charAt(0).toUpperCase() + result.slice(1);
}