        class UserManager {
            constructor() {
                this.container = document.querySelector('.ins-api-users');
                this.users = [];
                this.init();
            }

            init() {
                this.addStyles();
                this.loadUsers();
            }

            addStyles() {
                const style = document.createElement('style');
                style.textContent = `
                    .ins-api-users {
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 20px;
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        min-height: 100vh;
                    }

                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                    }

                    .header h1 {
                        color: white;
                        font-size: 2.5rem;
                        margin: 0;
                        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                    }

                    .loading {
                        text-align: center;
                        padding: 40px;
                        color: white;
                        font-size: 1.2rem;
                    }

                    .error {
                        background: #e74c3c;
                        color: white;
                        padding: 15px;
                        border-radius: 8px;
                        margin: 20px 0;
                        text-align: center;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    }

                    .users-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                        gap: 20px;
                        margin-top: 20px;
                    }

                    .user-card {
                        background: rgba(255, 255, 255, 0.95);
                        border-radius: 12px;
                        padding: 20px;
                        box-shadow: 0 8px 16px rgba(0,0,0,0.1);
                        transition: all 0.3s ease;
                        position: relative;
                        overflow: hidden;
                    }

                    .user-card:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 12px 24px rgba(0,0,0,0.15);
                    }

                    .user-card::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: 4px;
                        background: linear-gradient(90deg, #667eea, #764ba2);
                    }

                    .user-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 15px;
                    }

                    .user-name {
                        font-size: 1.3rem;
                        font-weight: bold;
                        color: #2c3e50;
                        margin: 0;
                    }

                    .delete-btn {
                        background: #e74c3c;
                        color: white;
                        border: none;
                        padding: 8px 12px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 0.9rem;
                        transition: all 0.3s ease;
                    }

                    .delete-btn:hover {
                        background: #c0392b;
                        transform: scale(1.05);
                    }

                    .user-info {
                        margin-bottom: 10px;
                    }

                    .user-email {
                        color: #3498db;
                        font-weight: 500;
                        margin-bottom: 8px;
                    }

                    .user-address {
                        color: #7f8c8d;
                        font-size: 0.95rem;
                        line-height: 1.4;
                    }

                    .refresh-btn {
                        position: fixed;
                        bottom: 30px;
                        right: 30px;
                        background: #27ae60;
                        color: white;
                        border: none;
                        padding: 15px 20px;
                        border-radius: 50px;
                        cursor: pointer;
                        font-size: 1rem;
                        box-shadow: 0 4px 12px rgba(39, 174, 96, 0.4);
                        transition: all 0.3s ease;
                    }

                    .refresh-btn:hover {
                        background: #229954;
                        transform: scale(1.1);
                    }

                    .cache-info {
                        text-align: center;
                        color: rgba(255, 255, 255, 0.8);
                        font-size: 0.9rem;
                        margin-bottom: 20px;
                    }

                    @media (max-width: 768px) {
                        .ins-api-users {
                            padding: 10px;
                        }

                        .users-grid {
                            grid-template-columns: 1fr;
                        }

                        .header h1 {
                            font-size: 1.8rem;
                        }
                    }
                `;
                document.head.appendChild(style);
            }

            showLoading() {
                this.container.innerHTML = `
                    <div class="header">
                        <h1>Kullanıcı Yönetimi</h1>
                    </div>
                    <div class="loading">
                        <div>🔄 Kullanıcılar yükleniyor...</div>
                    </div>
                `;
            }

            showError(message) {
                this.container.innerHTML = `
                    <div class="header">
                        <h1>Kullanıcı Yönetimi</h1>
                    </div>
                    <div class="error">
                        ❌ Hata: ${message}
                    </div>
                    <button class="refresh-btn" onclick="location.reload()">🔄 Tekrar Dene</button>
                `;
            }

            isDataExpired() {
                const timestamp = this.getFromStorage('users_timestamp');
                if (!timestamp) return true;

                const oneDay = 24 * 60 * 60 * 1000;
                return Date.now() - timestamp > oneDay;
            }

            saveToStorage(key, data) {
                try {
                    localStorage.setItem(key, JSON.stringify(data));
                } catch (error) {
                    console.warn('Veri kaydetme hatası:', error);
                }
            }

            getFromStorage(key) {
                try {
                    const data = localStorage.getItem(key);
                    return data ? JSON.parse(data) : null;
                } catch (error) {
                    console.warn('Veri okuma hatası:', error);
                    return null;
                }
            }

            removeFromStorage(key) {
                try {
                    localStorage.removeItem(key);
                } catch (error) {
                    console.warn('Veri silme hatası:', error);
                }
            }

            async fetchUsers() {
                try {
                    const response = await fetch('https://jsonplaceholder.typicode.com/users');
                    if (!response.ok) throw new Error(`HTTP Hatası: ${response.status}`);
                    const users = await response.json();
                    this.saveToStorage('users_data', users);
                    this.saveToStorage('users_timestamp', Date.now());
                    return users;
                } catch (error) {
                    throw new Error(`API'den veri alınamadı: ${error.message}`);
                }
            }

            async loadUsers() {
                this.showLoading();

                try {
                    let users;
                    const cachedUsers = this.getFromStorage('users_data');

                    if (cachedUsers && !this.isDataExpired()) {
                        users = cachedUsers;
                    } else {
                        users = await this.fetchUsers();
                    }

                    this.users = users;
                    this.renderUsers();

                } catch (error) {
                    console.error('Veri yükleme hatası:', error);
                    this.showError(error.message);
                }
            }

            deleteUser(userId) {
                if (confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
                    this.users = this.users.filter(user => user.id !== userId);
                    this.saveToStorage('users_data', this.users);
                    this.renderUsers();
                }
            }

            renderUsers() {
                const isFromCache = this.getFromStorage('users_data') && !this.isDataExpired();

                this.container.innerHTML = `
                    <div class="header">
                        <h1>Kullanıcı Yönetimi</h1>
                    </div>
                    ${isFromCache ? '<div class="cache-info">📱 Veriler localStorage\'dan yüklendi</div>' : '<div class="cache-info">🌐 Veriler API\'den yüklendi</div>'}
                    <div class="users-grid">
                        ${this.users.map(user => `
                            <div class="user-card">
                                <div class="user-header">
                                    <h3 class="user-name">${user.name}</h3>
                                    <button class="delete-btn" onclick="window.userManager.deleteUser(${user.id})">
                                        🗑️ Sil
                                    </button>
                                </div>
                                <div class="user-info">
                                    <div class="user-email">📧 ${user.email}</div>
                                    <div class="user-address">
                                        📍 ${user.address.street}, ${user.address.suite}<br>
                                        ${user.address.city} - ${user.address.zipcode}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <button class="refresh-btn" onclick="window.userManager.refreshData()">
                        🔄 Yenile
                    </button>
                `;
            }

            refreshData() {
                this.removeFromStorage('users_data');
                this.removeFromStorage('users_timestamp');
                this.loadUsers();
            }
        }

        let userManager;
        document.addEventListener('DOMContentLoaded', () => {
            userManager = new UserManager();
            window.userManager = userManager;
        });
