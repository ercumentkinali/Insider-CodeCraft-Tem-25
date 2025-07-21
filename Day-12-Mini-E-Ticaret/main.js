    $(document).ready(function () {
        let allProducts = [];
        let cartItems = [];
        let searchTimeout;

        $('.product-carousel').slick({
            dots: true,
            infinite: true,
            speed: 500,
            slidesToShow: 3,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 3000,
            responsive: [
                {
                    breakpoint: 1024,
                    settings: { slidesToShow: 2 }
                },
                {
                    breakpoint: 600,
                    settings: { slidesToShow: 1 }
                }
            ]
        });

        loadCartFromStorage();
        fetchAllProducts();
        fetchCategories();

        $('#searchBtn').on('click', handleSearch);
        $('#searchBox').on('input', handleSearchInput);
        $('#toggleCart').on('click', toggleCart);
        $('#clearCart').on('click', clearCart);
        $('#productList').on('click', '.add-to-cart-btn', handleAddToCart);
        $('#productList').on('click', '.detail-btn', handleProductDetail);
        $('#productList').on('click', '.product-image', handleImageClick);
        $('#cartItems').on('click', '.remove-from-cart', handleRemoveFromCart);
        $('#categoryButtons').on('click', '.category-btn', function () {
            const category = $(this).data('category');
            if (category === 'all') {
                displayProducts(allProducts);
            } else {
                const filtered = allProducts.filter(p => p.category === category);
                displayProducts(filtered);
            }
            $('.category-btn').removeClass('active');
            $(this).addClass('active');
        });

        $.fn.cartPlugin = function (options) {
            const settings = $.extend({
                action: 'add',
                product: null,
                callback: null
            }, options);

            return this.each(function () {
                if (settings.action === 'add' && settings.product) {
                    addToCartAnimation($(this), settings.product);
                } else if (settings.action === 'remove') {
                    removeFromCartAnimation($(this));
                }

                if (settings.callback && typeof settings.callback === 'function') {
                    settings.callback();
                }
            });
        };

        function fetchAllProducts() {
            $.ajax({
                url: 'https://fakestoreapi.com/products',
                method: 'GET',
                dataType: 'json',
                success: function (data) {
                    allProducts = data;
                    displayProducts(data);
                    $('#loading').fadeOut(500);
                },
                error: function () {
                    $('#loading').html('<p style="color: #ff6b6b;">Ürünler yüklenirken hata oluştu!</p>');
                }
            });
        }

        function fetchCategories() {
            $.ajax({
                url: 'https://fakestoreapi.com/products/categories',
                method: 'GET',
                dataType: 'json',
                success: function (categories) {
                    const $container = $('<div id="categoryButtons" class="category-buttons" style="display: flex; justify-content: center; gap: 10px; margin: 20px 0;"></div>');
                    $container.append(`<button class="category-btn active" data-category="all" style="padding: 8px 15px; border-radius: 20px; border: none; background: #333; color: white; cursor: pointer;">Tümünü Göster</button>`);
                    categories.forEach(cat => {
                        $container.append(`<button class="category-btn" data-category="${cat}" style="padding: 8px 15px; border-radius: 20px; border: none; background: #ccc; color: black; cursor: pointer;">${cat}</button>`);
                    });
                    $('.product-carousel').before($container);
                }
            });
        }

        function displayProducts(products) {
            const $productList = $('#productList');
            $productList.empty();

            if (products.length === 0) {
                $productList.html(`
                    <div class="empty-state">
                        <i class="fas fa-search"></i>
                        <p>Aradığınız kriterlere uygun ürün bulunamadı.</p>
                    </div>
                `);
                return;
            }

            const productTemplate = $(`
                <div class="product-card">
                    <img class="product-image" src="" alt="" data-fancybox="gallery">
                    <div class="product-title"></div>
                    <div class="product-price"></div>
                    <div class="product-description"></div>
                    <div class="product-buttons">
                        <button class="add-to-cart-btn"><i class="fas fa-cart-plus"></i> Sepete Ekle</button>
                        <button class="detail-btn"><i class="fas fa-info-circle"></i> Detay</button>
                    </div>
                </div>
            `);

            $.each(products, function (index, product) {
                const $productCard = productTemplate.clone(true);
                $productCard.find('.product-image').attr({ 'src': product.image, 'alt': product.title });
                $productCard.find('.product-title').text(product.title);
                $productCard.find('.product-price').text('$' + product.price);
                $productCard.find('.product-description').text(product.description);
                $productCard.data('product', product);
                $productList.append($productCard);
                setTimeout(function () {
                    $productCard.addClass('visible');
                }, index * 100);
            });
        }

        function handleSearchInput() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(function () {
                const searchValue = $('#searchBox').val().trim();
                if (searchValue === '') {
                    displayProducts(allProducts);
                } else if (!isNaN(searchValue) && searchValue >= 1 && searchValue <= 20) {
                    searchProductById(searchValue);
                }
            }, 300);
        }

        function handleSearch() {
            const searchValue = $('#searchBox').val().trim();
            if (searchValue === '') {
                displayProducts(allProducts);
                return;
            }
            if (isNaN(searchValue) || searchValue < 1 || searchValue > 20) {
                alert('Lütfen 1-20 arasında geçerli bir ürün ID\'si girin.');
                return;
            }
            searchProductById(searchValue);
        }

        function searchProductById(productId) {
            $('#loading').fadeIn(300);
            $.ajax({
                url: `https://fakestoreapi.com/products/${productId}`,
                method: 'GET',
                dataType: 'json',
                success: function (product) {
                    $('#loading').fadeOut(300);
                    displayProducts([product]);
                },
                error: function () {
                    $('#loading').fadeOut(300);
                    displayProducts([]);
                }
            });
        }

        function handleAddToCart(e) {
            const $button = $(this);
            const product = $button.closest('.product-card').data('product');
            $button.cartPlugin({
                action: 'add',
                product: product,
                callback: function () {
                    addToCart(product);
                }
            });
        }

        function addToCart(product) {
            const existingItem = cartItems.find(item => item.id === product.id);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cartItems.push({ ...product, quantity: 1 });
            }
            updateCartDisplay();
            saveCartToStorage();
            showAddToCartFeedback(product.title);
        }

        function addToCartAnimation($button, product) {
            $button.html('<i class="fas fa-check"></i> Eklendi!').prop('disabled', true);
            setTimeout(function () {
                $button.html('<i class="fas fa-cart-plus"></i> Sepete Ekle').prop('disabled', false);
            }, 1000);
        }

        function handleRemoveFromCart(e) {
            const $button = $(this);
            const productId = parseInt($button.closest('.cart-item').data('product-id'));
            $button.cartPlugin({
                action: 'remove',
                callback: function () {
                    removeFromCart(productId);
                }
            });
        }

        function removeFromCart(productId) {
            cartItems = cartItems.filter(item => item.id !== productId);
            updateCartDisplay();
            saveCartToStorage();
        }

        function removeFromCartAnimation($button) {
            const $cartItem = $button.closest('.cart-item');
            $cartItem.fadeOut(300, function () {
                $(this).remove();
            });
        }

        function clearCart() {
            if (cartItems.length === 0) {
                alert('Sepet zaten boş!');
                return;
            }
            if (confirm('Sepeti tamamen temizlemek istediğinizden emin misiniz?')) {
                cartItems = [];
                $('#cartItems').fadeOut(300, function () {
                    $(this).empty().fadeIn(300);
                });
                updateCartCount();
                saveCartToStorage();
                showClearCartFeedback();
            }
        }

        function updateCartDisplay() {
            const $cartItems = $('#cartItems');
            $cartItems.empty();
            if (cartItems.length === 0) {
                $cartItems.html(`
                    <div class="empty-state">
                        <i class="fas fa-shopping-cart"></i>
                        <p>Sepetiniz boş</p>
                    </div>
                `);
            } else {
                $.each(cartItems, function (index, item) {
                    const $cartItem = $(`
                        <div class="cart-item" data-product-id="${item.id}">
                            <img src="${item.image}" alt="${item.title}">
                            <div class="cart-item-info">
                                <div class="cart-item-title">${item.title}</div>
                                <div class="cart-item-price">$${item.price} x ${item.quantity}</div>
                            </div>
                            <button class="remove-from-cart">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `);
                    $cartItems.append($cartItem);
                });
            }
            updateCartCount();
        }

        function updateCartCount() {
            const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
            $('#cartCount').text(totalItems);
        }

        function toggleCart() {
            const $cartSection = $('#cartSection');
            const $toggleBtn = $('#toggleCart');
            if ($cartSection.is(':visible')) {
                $cartSection.slideUp(500);
                $toggleBtn.html('<i class="fas fa-shopping-cart"></i> Sepeti Göster <span class="cart-count" id="cartCount">' + $('#cartCount').text() + '</span>');
            } else {
                $cartSection.slideDown(500);
                $toggleBtn.html('<i class="fas fa-eye-slash"></i> Sepeti Gizle <span class="cart-count" id="cartCount">' + $('#cartCount').text() + '</span>');
            }
        }

        function handleProductDetail(e) {
            const product = $(this).closest('.product-card').data('product');
            const modalContent = `
                <div style="max-width: 600px; padding: 20px;">
                    <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                        <img src="${product.image}" alt="${product.title}" style="width: 200px; height: 200px; object-fit: contain; border-radius: 10px;">
                        <div style="flex: 1;">
                            <h2 style="color: #333; margin-bottom: 10px; font-size: 1.5em;">${product.title}</h2>
                            <p style="color: #667eea; font-size: 1.8em; font-weight: bold; margin-bottom: 10px;">${product.price}</p>
                            <div style="background: linear-gradient(45deg, #667eea, #764ba2); color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; margin-bottom: 15px;">
                                <i class="fas fa-tag"></i> ${product.category}
                            </div>
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                                <span style="color: #333;"><i class="fas fa-star" style="color: #ffd700;"></i> ${product.rating.rate}</span>
                                <span style="color: #666;">(${product.rating.count} değerlendirme)</span>
                            </div>
                        </div>
                    </div>
                    <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">${product.description}</p>
                    <button onclick="addToCartFromModal(${product.id})" style="background: linear-gradient(45deg, #11998e, #38ef7d); color: white; border: none; padding: 12px 25px; border-radius: 25px; cursor: pointer; font-size: 16px; width: 100%;">
                        <i class="fas fa-cart-plus"></i> Sepete Ekle
                    </button>
                </div>
            `;
            $.fancybox.open({
                src: modalContent,
                type: 'html',
                opts: {
                    animationEffect: 'fade',
                    animationDuration: 300,
                    toolbar: true,
                    smallBtn: true,
                    backdrop: 'rgba(0,0,0,0.8)'
                }
            });
        }

        window.addToCartFromModal = function (productId) {
            const product = allProducts.find(p => p.id === productId);
            if (product) {
                addToCart(product);
                $.fancybox.close();
            }
        };

        function handleImageClick(e) {
            e.preventDefault();
            const $img = $(this);
            $.fancybox.open({
                src: $img.attr('src'),
                type: 'image',
                opts: {
                    caption: $img.attr('alt'),
                    toolbar: true,
                    smallBtn: true,
                    protect: true
                }
            });
        }

        function saveCartToStorage() {
            console.log('Cart saved to memory:', cartItems);
        }

        function loadCartFromStorage() {
            cartItems = [];
            updateCartDisplay();
        }

        function showAddToCartFeedback(productTitle) {
            const $feedback = $(`
                <div style="position: fixed; top: 20px; right: 20px; background: linear-gradient(45deg, #11998e, #38ef7d); color: white; padding: 15px 20px; border-radius: 10px; z-index: 10000; box-shadow: 0 4px 15px rgba(0,0,0,0.3); animation: slideInRight 0.5s ease;">
                    <i class="fas fa-check-circle"></i> ${productTitle.substring(0, 30)}... sepete eklendi!
                </div>
            `);
            $('body').append($feedback);
            setTimeout(function () {
                $feedback.fadeOut(500, function () {
                    $(this).remove();
                });
            }, 3000);
        }

        function showClearCartFeedback() {
            const $feedback = $(`
                <div style="position: fixed; top: 20px; right: 20px; background: linear-gradient(45deg, #ff6b6b, #ee5a52); color: white; padding: 15px 20px; border-radius: 10px; z-index: 10000; box-shadow: 0 4px 15px rgba(0,0,0,0.3); animation: slideInRight 0.5s ease;">
                    <i class="fas fa-trash"></i> Sepet temizlendi!
                </div>
            `);
            $('body').append($feedback);
            setTimeout(function () {
                $feedback.fadeOut(500, function () {
                    $(this).remove();
                });
            }, 2000);
        }
    });
