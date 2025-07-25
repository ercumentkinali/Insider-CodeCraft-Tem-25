const appendLocation = 'body'; 

function getUsers() {
    try {
        const userData = localStorage.getItem('users');
        if (!userData) return null;
        
        const parsedData = JSON.parse(userData);
        
        if (parsedData.expireTime && Date.now() > parsedData.expireTime) {
            localStorage.removeItem('users');
            return null;
        }
        
        return parsedData.users || [];
    } catch (error) {
        console.error('Kullanıcı verilerini okuma hatası:', error);
        return null;
    }
}

function saveUsers(users, expireMinutes = 60) {
    try {
        const data = {
            users: users,
            expireTime: Date.now() + (expireMinutes * 60 * 1000)
        };
        localStorage.setItem('users', JSON.stringify(data));
    } catch (error) {
        console.error('Kullanıcı verilerini kaydetme hatası:', error);
    }
}

function fetchUsers() {
    return new Promise((resolve) => {
        setTimeout(() => {
            const users = [
                { id: 1, name: 'Ercüment Kınalı', email: 'ercumentkinali@example.com', role: 'Admin' },
                { id: 2, name: 'Ela Ünver', email: 'elaunver@example.com', role: 'User' },
                { id: 3, name: 'Eda Ünver', email: 'edaunver@example.com', role: 'User' },
                { id: 4, name: 'Yetkin Tunay', email: 'yetkintunay@example.com', role: 'Moderator' },
                { id: 5, name: 'Oğuzhan Ergin', email: 'oguzhanergin@example.com', role: 'User' }
            ];
            resolve(users);
        }, 1000);
    });
}

function renderUsers(users) {
    const container = document.querySelector(appendLocation);
    if (!container) {
        console.error(`Selector "${appendLocation}" bulunamadı!`);
        return;
    }

    const existingList = container.querySelector('#user-list');
    if (existingList) {
        existingList.remove();
    }

    const userListContainer = document.createElement('div');
    userListContainer.id = 'user-list';
    userListContainer.style.cssText = `
        margin: 20px 0;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background-color: #f9f9f9;
        font-family: Arial, sans-serif;
    `;

    const title = document.createElement('h3');
    title.textContent = 'Kullanıcı Listesi';
    title.style.marginTop = '0';
    userListContainer.appendChild(title);

    if (users.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = 'Henüz kullanıcı bulunmuyor.';
        emptyMessage.style.color = '#666';
        userListContainer.appendChild(emptyMessage);
    } else {
        users.forEach(user => {
            const userItem = document.createElement('div');
            userItem.style.cssText = `
                padding: 10px;
                margin: 5px 0;
                background-color: white;
                border-radius: 4px;
                border-left: 4px solid #007bff;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;

            const userInfo = document.createElement('div');
            userInfo.innerHTML = `
                <strong>${user.name}</strong><br>
                <small style="color: #666;">${user.email} - ${user.role}</small>
            `;

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Sil';
            deleteBtn.style.cssText = `
                background-color: #dc3545;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 4px;
                cursor: pointer;
            `;
            deleteBtn.onclick = () => deleteUser(user.id);

            userItem.appendChild(userInfo);
            userItem.appendChild(deleteBtn);
            userListContainer.appendChild(userItem);
        });
    }

    container.appendChild(userListContainer);
}

function deleteUser(userId) {
    let users = getUsers() || [];
    users = users.filter(user => user.id !== userId);
    saveUsers(users);
    renderUsers(users);
    console.log(`Kullanıcı ID ${userId} silindi.`);
}

function createReloadButton() {
    const container = document.querySelector(appendLocation);
    if (!container) return;

    const reloadBtn = document.createElement('button');
    reloadBtn.id = 'reload-users-btn';
    reloadBtn.textContent = 'Kullanıcıları Yeniden Yükle';
    reloadBtn.style.cssText = `
        background-color: #28a745;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        margin: 10px 0;
        font-size: 14px;
    `;

    reloadBtn.onclick = async () => {
        if (sessionStorage.getItem('reload-used')) {
            alert('Bu oturumda zaten kullanıcıları yeniden yüklediniz!');
            return;
        }

        reloadBtn.textContent = 'Yükleniyor...';
        reloadBtn.disabled = true;

        try {
            const users = await fetchUsers();
            saveUsers(users);
            renderUsers(users);
            
            sessionStorage.setItem('reload-used', 'true');
            
            console.log('Kullanıcılar başarıyla yeniden yüklendi!');
        } catch (error) {
            console.error('Kullanıcıları yüklerken hata:', error);
            alert('Kullanıcıları yüklerken bir hata oluştu!');
        } finally {
            reloadBtn.textContent = 'Kullanıcıları Yeniden Yükle';
            reloadBtn.disabled = false;
        }
    };

    container.appendChild(reloadBtn);
}

function setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                const userList = document.querySelector('#user-list');
                const reloadBtn = document.querySelector('#reload-users-btn');
                
                if (userList && !reloadBtn) {
                    const users = getUsers() || [];
                    if (users.length === 0) {
                        createReloadButton();
                    }
                }
                
                if (userList && reloadBtn) {
                    const users = getUsers() || [];
                    if (users.length > 0) {
                        reloadBtn.remove();
                    }
                }
            }
        });
    });

    const targetNode = document.querySelector(appendLocation);
    if (targetNode) {
        observer.observe(targetNode, {
            childList: true,
            subtree: true
        });
    }
}

async function initUserManagementSystem() {
    console.log('Kullanıcı yönetim sistemi başlatılıyor...');
    
    setupMutationObserver();
    
    let users = getUsers();
    
    if (!users || users.length === 0) {
        console.log('Kullanıcı verisi bulunamadı, API\'den çekiliyor...');
        try {
            users = await fetchUsers();
            saveUsers(users);
            console.log('Kullanıcılar başarıyla yüklendi ve kaydedildi.');
        } catch (error) {
            console.error('Kullanıcıları yüklerken hata:', error);
            users = [];
        }
    } else {
        console.log('Kullanıcılar localStorage\'dan yüklendi.');
    }
    
    renderUsers(users);
    
    if (users.length === 0) {
        createReloadButton();
    }
    
    console.log('Kullanıcı yönetim sistemi hazır!');
}

initUserManagementSystem();