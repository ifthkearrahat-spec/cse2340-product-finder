let products = [];
let savedItems = [];
let showSavedOnly = false;

const productList = document.getElementById('productList');
const searchInput = document.getElementById('searchInput');
const categorySelect = document.getElementById('categorySelect');
const sortSelect = document.getElementById('sortSelect');
const loadingBox = document.getElementById('loadingBox');
const errorBox = document.getElementById('errorBox');
const emptyBox = document.getElementById('emptyBox');
const pageHeading = document.getElementById('pageHeading');
const itemCount = document.getElementById('itemCount');
const allBtn = document.getElementById('allBtn');
const savedBtn = document.getElementById('savedBtn');
const savedCount = document.getElementById('savedCount');
const retryBtn = document.getElementById('retryBtn');
const detailsModal = document.getElementById('detailsModal');
const closeModal = document.getElementById('closeModal');
const modalInfo = document.getElementById('modalInfo');

function loadSavedItems() {
    let data = localStorage.getItem('savedProducts');
    if (data) {
        savedItems = JSON.parse(data);
    } else {
        savedItems = [];
    }
    savedCount.textContent = savedItems.length;
}

function saveToLocalStorage() {
    localStorage.setItem('savedProducts', JSON.stringify(savedItems));
    savedCount.textContent = savedItems.length;
}

function checkSaved(id) {
    let found = savedItems.find(function (item) {
        return item.id === id;
    });
    return found !== undefined;
}

function toggleSave(id) {
    let product = products.find(function (p) {
        return p.id === id;
    });

    if (!product) {
        product = savedItems.find(function (p) {
            return p.id === id;
        });
    }

    if (checkSaved(id)) {
        savedItems = savedItems.filter(function (item) {
            return item.id !== id;
        });
    } else if (product) {
        savedItems.push(product);
    }

    saveToLocalStorage();
    updateView();
}

async function getProducts() {
    loadingBox.style.display = 'block';
    errorBox.style.display = 'none';
    emptyBox.style.display = 'none';
    productList.innerHTML = '';

    try {
        let res = await fetch('https://dummyjson.com/products?limit=30');
        if (!res.ok) {
            throw new Error('Failed to fetch');
        }
        let data = await res.json();
        products = data.products;

        loadingBox.style.display = 'none';
        loadCategories();
        updateView();
    } catch (err) {
        loadingBox.style.display = 'none';
        errorBox.style.display = 'block';
    }
}

function loadCategories() {
    let allCats = products.map(function (p) {
        return p.category;
    });

    let uniqueCats = [];
    allCats.forEach(function (cat) {
        if (!uniqueCats.includes(cat)) {
            uniqueCats.push(cat);
        }
    });

    categorySelect.innerHTML = '<option value="all">All Categories</option>';
    uniqueCats.forEach(function (cat) {
        let opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
        categorySelect.appendChild(opt);
    });
}

function showProducts(list) {
    productList.innerHTML = '';
    itemCount.textContent = list.length + ' items';

    if (list.length === 0) {
        emptyBox.style.display = 'block';
        return;
    }

    emptyBox.style.display = 'none';

    list.forEach(function (item) {
        let card = document.createElement('div');
        card.className = 'card';

        let isSaved = checkSaved(item.id);
        let shortDesc = item.description.length > 75 ? item.description.slice(0, 75) + '...' : item.description;

        card.innerHTML =
            '<img src="' + item.thumbnail + '" alt="' + item.title + '">' +
            '<span class="card-cat">' + item.category + '</span>' +
            '<h4>' + item.title + '</h4>' +
            '<p>' + shortDesc + '</p>' +
            '<div class="card-price">' +
                '<span>$' + item.price + '</span>' +
                '<span>Rating: ' + item.rating + '</span>' +
            '</div>' +
            '<div class="card-btns">' +
                '<button class="btn blue-btn details-btn">Details</button>' +
                '<button class="btn save-btn ' + (isSaved ? 'saved' : '') + '">' +
                    (isSaved ? 'Saved' : 'Save') +
                '</button>' +
            '</div>';

        let detailsBtn = card.querySelector('.details-btn');
        let saveBtn = card.querySelector('.save-btn');

        detailsBtn.addEventListener('click', function () {
            openDetails(item);
        });

        saveBtn.addEventListener('click', function () {
            toggleSave(item.id);
        });

        productList.appendChild(card);
    });
}

function updateView() {
    let source = showSavedOnly ? savedItems.slice() : products.slice();
    let text = searchInput.value.toLowerCase().trim();
    let cat = categorySelect.value;
    let sort = sortSelect.value;

    if (text !== '') {
        source = source.filter(function (p) {
            return p.title.toLowerCase().includes(text) ||
                p.description.toLowerCase().includes(text);
        });
    }

    if (cat !== 'all') {
        source = source.filter(function (p) {
            return p.category === cat;
        });
    }

    if (sort === 'low') {
        source.sort(function (a, b) {
            return a.price - b.price;
        });
    } else if (sort === 'high') {
        source.sort(function (a, b) {
            return b.price - a.price;
        });
    }

    showProducts(source);
}

function openDetails(item) {
    modalInfo.innerHTML =
        '<img src="' + item.thumbnail + '" alt="' + item.title + '">' +
        '<h3>' + item.title + '</h3>' +
        '<p>' + item.description + '</p>' +
        '<p><strong>Category:</strong> ' + item.category + '</p>' +
        '<p><strong>Brand:</strong> ' + (item.brand ? item.brand : 'N/A') + '</p>' +
        '<p><strong>Price:</strong> $' + item.price + '</p>' +
        '<p><strong>Rating:</strong> ' + item.rating + ' / 5</p>' +
        '<p><strong>Stock:</strong> ' + item.stock + '</p>';

    detailsModal.style.display = 'flex';
}

searchInput.addEventListener('input', updateView);
categorySelect.addEventListener('change', updateView);
sortSelect.addEventListener('change', updateView);
retryBtn.addEventListener('click', getProducts);

allBtn.addEventListener('click', function () {
    showSavedOnly = false;
    allBtn.classList.add('active');
    savedBtn.classList.remove('active');
    pageHeading.textContent = 'All Products';
    updateView();
});

savedBtn.addEventListener('click', function () {
    showSavedOnly = true;
    savedBtn.classList.add('active');
    allBtn.classList.remove('active');
    pageHeading.textContent = 'Saved Products';
    updateView();
});

closeModal.addEventListener('click', function () {
    detailsModal.style.display = 'none';
});

window.addEventListener('click', function (e) {
    if (e.target === detailsModal) {
        detailsModal.style.display = 'none';
    }
});

loadSavedItems();
getProducts();
