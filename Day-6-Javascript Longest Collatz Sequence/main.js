
        function getCollatzLength(n) {
            let length = 0;
            let current = n;
            
            while (current !== 1) {
                if (current % 2 === 0) {
                    current = current / 2;
                } else {
                    current = 3 * current + 1;
                }
                length++;
            }
            
            return length + 1; 
        }
        
        function getCollatzSequence(n) {
            let sequence = [n];
            let current = n;
            
            while (current !== 1) {
                if (current % 2 === 0) {
                    current = current / 2;
                } else {
                    current = 3 * current + 1;
                }
                sequence.push(current);
            }
            
            return sequence;
        }
        
        async function findLongestSequence() {
            const maxNum = parseInt(document.getElementById('maxNumber').value) || 1000000;
            const progressContainer = document.getElementById('progressContainer');
            const progressBar = document.getElementById('progressBar');
            const results = document.getElementById('results');
            const stats = document.getElementById('stats');
            const sequenceDisplay = document.getElementById('sequenceDisplay');
            
            progressContainer.style.display = 'block';
            results.style.display = 'none';
            
            let longestLength = 0;
            let longestNumber = 0;
            let totalCalculations = 0;
            
            const startTime = Date.now();
            
            const memo = new Map();
            
            for (let i = 1; i < maxNum; i++) {
                let length;
                
                if (memo.has(i)) {
                    length = memo.get(i);
                } else {
                    length = getCollatzLength(i);
                    memo.set(i, length);
                }
                
                if (length > longestLength) {
                    longestLength = length;
                    longestNumber = i;
                }
                
                totalCalculations++;
                
                if (i % 10000 === 0) {
                    const progress = (i / maxNum) * 100;
                    progressBar.style.width = progress + '%';
                    progressBar.textContent = Math.round(progress) + '%';
                    
                    await new Promise(resolve => setTimeout(resolve, 1));
                }
            }
            
            const endTime = Date.now();
            const executionTime = (endTime - startTime) / 1000;
            
            progressContainer.style.display = 'none';

            const longestSequence = getCollatzSequence(longestNumber);
            
            stats.innerHTML = `
                <div class="stat-box">
                    <div class="stat-number">${longestNumber.toLocaleString()}</div>
                    <div>En Uzun Dizi Başlangıcı</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number">${longestLength.toLocaleString()}</div>
                    <div>Dizi Uzunluğu</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number">${totalCalculations.toLocaleString()}</div>
                    <div>Toplam Hesaplama</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number">${executionTime.toFixed(2)}s</div>
                    <div>Hesaplama Süresi</div>
                </div>
            `;
            
            let displaySequence;
            if (longestSequence.length > 60) {
                displaySequence = [
                    ...longestSequence.slice(0, 50),
                    '...',
                    ...longestSequence.slice(-10)
                ];
            } else {
                displaySequence = longestSequence;
            }
            
            sequenceDisplay.innerHTML = `
                <h3>🎯 En Uzun Collatz Dizisi (${longestNumber} → 1):</h3>
                <div class="sequence-display">
                    ${displaySequence.map((num, index) => {
                        if (num === '...') return '<span class="highlight">...</span>';
                        return `<span>${num}</span>`;
                    }).join(' → ')}
                </div>
                <p><strong>Maksimum değer dizide:</strong> ${Math.max(...longestSequence.filter(x => x !== '...')).toLocaleString()}</p>
            `;
            
            results.style.display = 'block';
        }
        
        function showSpecificSequence() {
            const num = parseInt(prompt('Hangi sayının Collatz dizisini görmek istiyorsunuz?'));
            
            if (isNaN(num) || num < 1) {
                alert('Lütfen geçerli bir pozitif tam sayı girin.');
                return;
            }
            
            const sequence = getCollatzSequence(num);
            const results = document.getElementById('results');
            const stats = document.getElementById('stats');
            const sequenceDisplay = document.getElementById('sequenceDisplay');
            
            stats.innerHTML = `
                <div class="stat-box">
                    <div class="stat-number">${num.toLocaleString()}</div>
                    <div>Başlangıç Sayısı</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number">${sequence.length}</div>
                    <div>Dizi Uzunluğu</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number">${Math.max(...sequence).toLocaleString()}</div>
                    <div>Maksimum Değer</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number">${sequence.filter(x => x % 2 === 0).length}</div>
                    <div>Çift Sayı Adedi</div>
                </div>
            `;
            
            sequenceDisplay.innerHTML = `
                <h3>🎯 ${num} için Collatz Dizisi:</h3>
                <div class="sequence-display">
                    ${sequence.map((num, index) => {
                        if (index === 0) return `<span class="highlight">${num}</span>`;
                        if (num === 1) return `<span class="highlight">${num}</span>`;
                        return `<span>${num}</span>`;
                    }).join(' → ')}
                </div>
            `;
            
            results.style.display = 'block';
        }
        
        document.getElementById('maxNumber').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                findLongestSequence();
            }
        });
        
        window.addEventListener('load', function() {
            setTimeout(() => {
                const sequence = getCollatzSequence(13);
                const results = document.getElementById('results');
                const stats = document.getElementById('stats');
                const sequenceDisplay = document.getElementById('sequenceDisplay');
                
                stats.innerHTML = `
                    <div class="stat-box">
                        <div class="stat-number">13</div>
                        <div>Örnek Sayı</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-number">${sequence.length}</div>
                        <div>Dizi Uzunluğu</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-number">${Math.max(...sequence)}</div>
                        <div>Maksimum Değer</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-number">${sequence.filter(x => x % 2 === 0).length}</div>
                        <div>Çift Sayı Adedi</div>
                    </div>
                `;
                
                sequenceDisplay.innerHTML = `
                    <h3>🎯 Örnek: 13 için Collatz Dizisi:</h3>
                    <div class="sequence-display">
                        ${sequence.map((num, index) => {
                            if (index === 0) return `<span class="highlight">${num}</span>`;
                            if (num === 1) return `<span class="highlight">${num}</span>`;
                            return `<span>${num}</span>`;
                        }).join(' → ')}
                    </div>
                `;
                
                results.style.display = 'block';
            }, 1000);
        });
