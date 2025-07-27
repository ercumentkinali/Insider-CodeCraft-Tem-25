(() => {
    const loadJQueryAndStart = () => {
        if (typeof window.jQuery === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js';
            script.onload = () => initCarousel();
            document.head.appendChild(script);
        } else {
            initCarousel();
        }
    };

    const initCarousel = () => {
        const $ = window.jQuery;
        const API_URL = 'https://gist.githubusercontent.com/sevindi/5765c5812bbc8238a38b3cf52f233651/raw/56261d81af8561bf0a7cf692fe572f9e1e91f372/products.json';
        const PRODUCTS_KEY = 'lcw_carousel_products';
        const FAVORITES_KEY = 'lcw_carousel_favorites';
        const CONTAINER_ID = 'lcw-product-carousel';

        let products = [];
        let favorites = [];
        let index = 0;

        const getVisibleCount = () => {
            const w = window.innerWidth;
            if (w >= 1200) return 4;
            if (w >= 992) return 3;
            if (w >= 576) return 2;
            return 1;
        };

        const fetchProducts = async () => {
            const cached = localStorage.getItem(PRODUCTS_KEY);
            if (cached) return JSON.parse(cached);
            
            const res = await fetch(API_URL);
            const data = await res.json();
            const validProducts = data.filter(p => p && p.id);
            localStorage.setItem(PRODUCTS_KEY, JSON.stringify(validProducts));
            return validProducts;
        };

        const loadFavorites = () => {
            const stored = localStorage.getItem(FAVORITES_KEY);
            return stored ? JSON.parse(stored) : [];
        };

        const saveFavorites = () => {
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        };

        const toggleFavorite = (id) => {
            const idx = favorites.indexOf(id);
            if (idx >= 0) favorites.splice(idx, 1);
            else favorites.push(id);
            saveFavorites();
        };

        const render = () => {
            const html = `
                <style>
                    #${CONTAINER_ID} {
                        margin: 30px 0;
                        font-family: Arial, sans-serif;
                        position: relative;
                        padding: 0 15px;
                    }
                    #${CONTAINER_ID} h2 {
                        font-size: 24px;
                        font-weight: 600;
                        margin-bottom: 20px;
                        color: #333;
                    }
                    .carousel-controls {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        position: relative;
                    }
                    .carousel-nav {
                        background: #fff;
                        border: 1px solid #ddd;
                        border-radius: 50%;
                        width: 44px;
                        height: 44px;
                        flex-shrink: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 2;
                        cursor: pointer;
                        color: #666;
                        font-size: 18px;
                        font-weight: bold;
                        transition: all 0.2s ease;
                    }
                    .carousel-nav:hover {
                        background: #f8f9fa;
                        border-color: #007bff;
                        color: #007bff;
                    }
                    .carousel-nav:disabled {
                        opacity: 0.3;
                        cursor: not-allowed;
                    }
                    .carousel-nav:disabled:hover {
                        background: #fff;
                        border-color: #ddd;
                        color: #666;
                    }
                    .carousel-container {
                        flex: 1;
                        overflow: hidden;
                        position: relative;
                    }
                    .carousel-track {
                        display: flex;
                        gap: 15px;
                        transition: transform 0.3s ease;
                        will-change: transform;
                        width: max-content;
                    }
                    .product-card {
                        flex: 0 0 auto;
                        width: 250px;
                        border: 1px solid #e0e0e0;
                        border-radius: 8px;
                        overflow: hidden;
                        background: #fff;
                        position: relative;
                        cursor: pointer;
                        transition: transform 0.2s ease, box-shadow 0.2s ease;
                    }
                    .product-card:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    }
                    .product-card .image-container {
                        position: relative;
                        width: 100%;
                        height: 300px;
                        overflow: hidden;
                    }
                    .product-card img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        transition: transform 0.3s ease;
                    }
                    .product-card:hover img {
                        transform: scale(1.05);
                    }
                    .product-card .info {
                        padding: 15px;
                    }
                    .product-card .info h3 {
                        font-size: 14px;
                        font-weight: 500;
                        margin: 0 0 8px 0;
                        color: #333;
                        line-height: 1.4;
                        height: 40px;
                        overflow: hidden;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                    }
                    .product-card .info .price {
                        font-size: 16px;
                        font-weight: 600;
                        color: #e74c3c;
                    }
                    .heart-btn {
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        background: rgba(255, 255, 255, 0.9);
                        border: none;
                        border-radius: 50%;
                        width: 36px;
                        height: 36px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        z-index: 2;
                    }
                    .heart-btn:hover {
                        background: white;
                        transform: scale(1.1);
                    }
                    .heart-btn svg {
                        fill: #666;
                        transition: fill 0.2s ease;
                    }
                    .heart-btn.active svg {
                        fill: #007bff;
                    }

                    /* Responsive Design */
                    @media (max-width: 1200px) {
                        .product-card { 
                            width: 220px; 
                        }
                        .product-card .image-container { 
                            height: 260px; 
                        }
                    }
                    @media (max-width: 992px) {
                        .product-card { 
                            width: 200px; 
                        }
                        .product-card .image-container { 
                            height: 240px; 
                        }
                        #${CONTAINER_ID} h2 {
                            font-size: 22px;
                        }
                    }
                    @media (max-width: 768px) {
                        .product-card { 
                            width: 180px; 
                        }
                        .product-card .image-container { 
                            height: 220px; 
                        }
                        #${CONTAINER_ID} {
                            padding: 0 10px;
                        }
                        .carousel-track {
                            gap: 10px;
                        }
                    }
                    @media (max-width: 576px) {
                        .product-card { 
                            width: 160px; 
                        }
                        .product-card .image-container { 
                            height: 200px; 
                        }
                        #${CONTAINER_ID} h2 {
                            font-size: 20px;
                        }
                        .carousel-nav {
                            width: 36px;
                            height: 36px;
                        }
                    }
                    @media (max-width: 480px) {
                        .product-card { 
                            width: 140px; 
                        }
                        .product-card .image-container { 
                            height: 180px; 
                        }
                        .product-card .info {
                            padding: 10px;
                        }
                        .product-card .info h3 {
                            font-size: 13px;
                            height: 36px;
                        }
                        .product-card .info .price {
                            font-size: 14px;
                        }
                    }
                </style>
                <div id="${CONTAINER_ID}">
                    <h2>You Might Also Like</h2>
                    <div class="carousel-controls">
                        <button class="carousel-nav prev">&lt;</button>
                        <div class="carousel-container">
                            <div class="carousel-track">
                                ${products.map(p => `
                                    <div class="product-card" data-id="${p.id}" data-url="${p.url}">
                                        <div class="image-container">
                                            <img src="${p.img}" alt="${p.name}" loading="lazy">
                                            <div class="heart-btn ${favorites.includes(p.id) ? 'active' : ''}" data-id="${p.id}">
                                                <svg width="20" height="20" viewBox="0 0 24 24">
                                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                                </svg>
                                            </div>
                                        </div>
                                        <div class="info">
                                            <h3>${p.name}</h3>
                                            <div class="price">${p.price} TL</div>
                                        </div>
                                    </div>`).join('')}
                            </div>
                        </div>
                        <button class="carousel-nav next">&gt;</button>
                    </div>
                </div>
            `;

            $('.product-detail').after(html);

            const move = () => {
                const $track = $('.carousel-track');
                const $cards = $('.product-card');
                
                if (!$cards.length) return;
                const cardOuterWidth = $cards.first().outerWidth();
                const gap = 15;
                const cardTotalWidth = cardOuterWidth + gap;
                
                const visible = getVisibleCount();
                const total = $cards.length;
                const maxIndex = Math.max(0, total - visible);

                index = Math.max(0, Math.min(index, maxIndex));

                const translateX = index * cardTotalWidth;
                $track.css('transform', `translateX(-${translateX}px)`);
                
                $('.carousel-nav.prev').prop('disabled', index <= 0);
                $('.carousel-nav.next').prop('disabled', index >= maxIndex);
                
            };

            $('.product-card').on('click', function (e) {
                if (!$(e.target).closest('.heart-btn').length) {
                    const url = $(this).data('url');
                    if (url) {
                        window.open(url, '_blank');
                    }
                }
            });

            $('.heart-btn').on('click', function (e) {
                e.stopPropagation();
                const id = parseInt($(this).data('id'));
                toggleFavorite(id);
                $(this).toggleClass('active');
            });

            $('.carousel-nav.prev').on('click', () => {
                if (index > 0) {
                    index--;
                    move();
                }
            });

            $('.carousel-nav.next').on('click', () => {
                const visible = getVisibleCount();
                const maxIndex = Math.max(0, products.length - visible);
                if (index < maxIndex) {
                    index++;
                    move();
                }
            });

            $(window).on('resize', () => {
                move();
            });

            setTimeout(() => {
                move();
            }, 500);
        };

        const start = async () => {
            if ($(`#${CONTAINER_ID}`).length > 0) {
                return;
            }

            if (!$('.product-detail').length) {
                $('body').append('<div class="product-detail" style="background: #f0f0f0; padding: 20px; margin: 20px; border: 1px solid #ccc;">Product Detail Section (Test)</div>');
            }

            products = await fetchProducts();
            favorites = loadFavorites();
            
            render();
        };

        start();
    };

    loadJQueryAndStart();
})();
