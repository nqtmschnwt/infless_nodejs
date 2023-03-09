// Define the number of products and products per page
const numProducts = 100;
const productsPerPage = 12;

// Calculate the number of pages
const numPages = Math.ceil(numProducts / productsPerPage);

// Get the product row and pagination element
const productRow = document.getElementById('product-row');
const pagination = document.getElementById('pagination');

// Create the pagination buttons
for (let i = 1; i <= numPages; i++) {
  const button = document.createElement('li');
  button.classList.add('page-item');
  if (i === 1) {
    button.classList.add('active');
  }
  const link = document.createElement('a');
  link.classList.add('page-link');
  link.href = '#';
  link.textContent = i;
  button.appendChild(link);
  pagination.appendChild(button);
}

// Show the first page of products
showPage(1);

// Define the showPage function
function showPage(pageNumber) {
  // Calculate the start and end indices of the products for the current page
  const startIndex = (pageNumber - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;

  // Clear the current products from the product row
  productRow.innerHTML = '';

  // Loop through the products for the current page and add them to the product row
  for (let i = startIndex; i < endIndex && i < numProducts; i++) {
    const product = document.createElement('div');
    product.classList.add('card', 'col-12', 'col-md-6', 'col-lg-4', 'mb-4');

    const image = document.createElement('img');
    image.classList.add('card-img-top');
    image.src = `https://via.placeholder.com/300x200?text=Product+${i+1}`;

    const body = document.createElement('div');
    body.classList.add('card-body');

    const title = document.createElement('h5');
    title.classList.add('card-title');
    title.textContent = `Product ${i+1}`;

    const description = document.createElement('p');
    description.classList.add('card-text');
    description.textContent = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

    const rating = document.createElement('div');
    rating.classList.add('rating');
    for (let j = 0; j < 5; j++) {
      const star = document.createElement('span');
      star.classList.add('fa', 'fa-star', 'checked');
      rating.appendChild(star);
    }

    const button = document.createElement('a');
    button.classList.add('btn', 'btn-primary');
    button.href = '#';
    button.textContent = 'Learn more';

    body.appendChild(title);
    body.appendChild(description);
    body.appendChild(rating);
    body.appendChild(button);
    product.appendChild(image);
    product.appendChild(body);

    productRow.appendChild(product);
  }

  // Update the active class for the pagination buttons
  const buttons = pagination.getElementsByTagName('li');
  for (let i = 0; i < buttons.length; i++) {
    if (i === pageNumber - 1) {
      buttons[i].classList.add('active');
    } else {
      buttons[i].classList.remove('active');
    }
  }
}

// Attach click event listeners to the pagination buttons
pagination.addEventListener('click', function(event) {
  event.preventDefault();
  if (event.target.classList.contains('page-link')) {
    const pageNumber = parseInt(event.target.textContent);
    showPage(pageNumber);
}
});
