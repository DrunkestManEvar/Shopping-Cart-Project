const cartIcon = document.querySelector('.cart-icon-container .cart-icon');
const totalItemsInCartDOM = document.getElementById('total-items-in-cart');
const productsContainer = document.querySelector('.products-center');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const closeCartBtn = document.querySelector('.close-cart-btn');
const cartItemContainer = document.querySelector('.cart-item-container');
const cartTotalPriceDOM = document.getElementById('total-price');
const clearAllItemsBtn = document.querySelector('.clear-all-btn');

let cart = [];
let cartBtnsDOM = [];

class Products {
  async getProducts() {
    try {
      const data = await fetch('products.json');
      const dataArray = await data.json();
      let products = dataArray.items;
      products = products.map(item => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const { url: img } = item.fields.image.fields.file;
        return { title, price, img, id };
      });
      return products;
    } catch (error) {
      console.error(error);
    }
  }
}

class LocalStorage {
  static saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
  }

  static getProducts() {
    return JSON.parse(localStorage.getItem('products'));
  }

  static saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem('cart');
  }
}

class UI {
  showProducts(fetchedProducts) {
    productsContainer.innerHTML = fetchedProducts
      .map(item => {
        return `
      <div class="product-card">
          <div class="img-container">
            <img
              src=${item.img}
              alt="${item.title}"
              class="product-img"
            />
            <button class="add-to-cart-btn" data-id="${item.id}">
              <i class="fas fa-shopping-cart cart-icon"></i> Add to cart
            </button>
          </div>
          <h3 class="product-name">${item.title}</h3>
          <h4 class="product-price">$${item.price}</h4>
        </div>
      `;
      })
      .join('');
  }

  getCartBtns() {
    const cartBtns = [...document.querySelectorAll('.add-to-cart-btn')];
    cartBtnsDOM = cartBtns;
    cartBtnsDOM.forEach(btn => {
      const id = btn.dataset.id;
      const inCart = cart.find(item => item.id === id);
      if (inCart) {
        this.disableBtn(btn);
      }
      btn.addEventListener('click', e => {
        this.disableBtn(e.target);
        const products = LocalStorage.getProducts();
        let itemToCart = products.find(item => item.id === id);
        itemToCart = { ...itemToCart, amount: 1 };
        cart = [...cart, itemToCart];
        LocalStorage.saveCart(cart);
        this.addToCart(itemToCart);
        this.calcCartValues(cart);
        this.showCart();
      });
    });
  }

  disableBtn(btn) {
    btn.innerText = 'In Cart';
    btn.disabled = true;
  }

  activateBtn(id) {
    const buttonToActivate = cartBtnsDOM.find(btn => btn.dataset.id === id);
    buttonToActivate.innerHTML =
      '<i class="fas fa-shopping-cart cart-icon"></i> Add to cart';
    buttonToActivate.disabled = false;
  }

  fillCart(cart) {
    cartItemContainer.innerHTML = cart
      .map(item => {
        return `<div class="cart-item">
      <img
        src=${item.img}
        alt="${item.title}"
        class="cart-item-img"
      />
      <div class="cart-item-info">
        <h4 class="cart-item-heading">${item.title}</h4>
        <h5 class="cart-item-price">$${item.price}</h5>
        <p class="remove-item-btn" data-id="${item.id}">Remove</p>
      </div>
      <div class="cart-item-amount-container">
        <i class="fas fa-chevron-up" data-id="${item.id}"></i>
        <p class="cart-item-amount">${item.amount}</p>
        <i class="fas fa-chevron-down" data-id="${item.id}"></i>
      </div>
    </div>`;
      })
      .join('');
  }

  addToCart(item) {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
    <img
      src=${item.img}
      alt="${item.title}"
      class="cart-item-img"
    />
    <div class="cart-item-info">
      <h4 class="cart-item-heading">${item.title}</h4>
      <h5 class="cart-item-price">$${item.price}</h5>
      <p class="remove-item-btn" data-id="${item.id}">Remove</p>
    </div>
    <div class="cart-item-amount-container">
      <i class="fas fa-chevron-up" data-id="${item.id}"></i>
      <p class="cart-item-amount">${item.amount}</p>
      <i class="fas fa-chevron-down" data-id="${item.id}"></i>
    </div>
  `;
    cartItemContainer.appendChild(div);
  }

  calcCartValues(cart) {
    const itemsTotal = cart.reduce((acc, curr) => {
      acc += curr.amount;
      return acc;
    }, 0);
    totalItemsInCartDOM.innerText = itemsTotal;

    const priceTotal = cart.reduce((acc, curr) => {
      acc += curr.price * curr.amount;
      return acc;
    }, 0);
    cartTotalPriceDOM.innerText = `$ ${priceTotal.toFixed(2)}`;
  }

  showCart() {
    cartDOM.classList.add('show-cart');
    cartOverlay.classList.add('show-cart-overlay');
  }

  hideCart() {
    cartDOM.classList.remove('show-cart');
    cartOverlay.classList.remove('show-cart-overlay');
  }

  checkIfHideCart = () => cart.length === 0 && this.hideCart();

  handleRemoveItem = e => {
    const id = e.target.dataset.id;
    this.removeItem(id);
    const itemToRemoveFromDOM = e.target.parentElement.parentElement;
    cartItemContainer.removeChild(itemToRemoveFromDOM);
    this.activateBtn(id);
    this.checkIfHideCart();
  };

  removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    LocalStorage.saveCart(cart);
  }

  handleIncreaseAmount = e => {
    const id = e.target.dataset.id;
    this.increaseAmount(id);
    const increasedItem = cart.find(item => item.id === id);
    e.target.nextElementSibling.innerText = increasedItem.amount;
  };

  increaseAmount(id) {
    cart = cart.map(item => {
      if (item.id === id) {
        item.amount = item.amount + 1;
        return item;
      }
      return item;
    });
    LocalStorage.saveCart(cart);
  }

  handleDecreaseAmount = e => {
    const id = e.target.dataset.id;
    this.decreaseAmount(id);
    const decreasedItem = cart.find(item => item.id === id);
    e.target.previousElementSibling.innerText = decreasedItem.amount;
    if (decreasedItem.amount === 0) {
      this.removeItem(id);
      this.activateBtn(id);
      cartItemContainer.removeChild(e.target.parentElement.parentElement);
      this.checkIfHideCart();
    }
  };

  decreaseAmount(id) {
    cart = cart.map(item => {
      if (item.id === id) {
        item.amount = item.amount - 1;
        return item;
      }
      return item;
    });
    LocalStorage.saveCart(cart);
  }

  setupApp() {
    cart = LocalStorage.getCart() ? JSON.parse(LocalStorage.getCart()) : [];

    this.fillCart(cart);

    this.calcCartValues(cart);

    cartIcon.addEventListener('click', () => {
      this.showCart();
    });

    closeCartBtn.addEventListener('click', () => {
      this.hideCart();
    });

    cartItemContainer.addEventListener('click', e => {
      if (e.target.classList.contains('remove-item-btn')) {
        this.handleRemoveItem(e);
      }

      if (e.target.classList.contains('fa-chevron-up')) {
        this.handleIncreaseAmount(e);
      }

      if (e.target.classList.contains('fa-chevron-down')) {
        this.handleDecreaseAmount(e);
      }

      this.calcCartValues(cart);
    });

    cartOverlay.addEventListener('click', this.hideCart);

    clearAllItemsBtn.addEventListener('click', () => {
      while (cartItemContainer.children.length > 0) {
        const itemToRemove = cartItemContainer.children[0];
        const itemToRemoveId = itemToRemove.children[1].children[2].dataset.id;
        this.removeItem(itemToRemoveId);
        this.activateBtn(itemToRemoveId);
        cartItemContainer.removeChild(itemToRemove);
      }
      this.calcCartValues(cart);
      this.hideCart();
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const products = new Products();
  const ui = new UI();

  products
    .getProducts()
    .then(products => {
      ui.showProducts(products);
      LocalStorage.saveProducts(products);
      ui.setupApp();
    })
    .then(() => {
      ui.getCartBtns();
    });
});
