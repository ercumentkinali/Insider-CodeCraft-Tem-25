const kullanici = {
    isim: prompt("Adınızı girin:"),
    yas: parseInt(prompt("Yaşınızı girin:")),
    meslek: prompt("Mesleğinizi girin:")
};

let sepet = [
    { name: "Elma", price: 55 },
    { name: "Muz", price: 100 },
    { name: "Portakal", price: 120 }
];

function sepetiListele() {
    console.log("\n--- SEPETİNİZ ---");
    if (sepet.length === 0) {
        console.log("Sepetiniz boş.");
    } else {
        sepet.forEach((urun, index) => {
            console.log(`${index + 1}. ${urun.name} - ${urun.price} TL`);
        });
    }
}

function urunEkle(isim, fiyat) {
    sepet.push({ name: isim, price: fiyat });
    console.log(`${isim} sepete eklendi!`);
}

function urunCikar(urunIsmi) {
    const index = sepet.findIndex(urun => urun.name.toLowerCase() === urunIsmi.toLowerCase());
    
    if (index !== -1) {
        const cikarilanUrun = sepet.splice(index, 1)[0];
        console.log(`${cikarilanUrun.name} sepetten çıkarıldı!`);
        return true;
    } else {
        console.log(`${urunIsmi} sepette bulunamadı!`);
        return false;
    }
}

function sepetToplaminiHesapla() {
    return sepet.reduce((toplam, urun) => toplam + urun.price, 0);
}

function dinamikUrunEkle() {
    const devamEt = confirm("Yeni ürün eklemek istiyor musunuz?");
    
    if (devamEt) {
        const urunIsmi = prompt("Eklemek istediğiniz ürünün ismini girin:");
        const urunFiyati = parseFloat(prompt("Ürünün fiyatını girin:"));
        
        if (urunIsmi && !isNaN(urunFiyati) && urunFiyati > 0) {
            urunEkle(urunIsmi, urunFiyati);
            sepetiListele();
            console.log(`Yeni sepet toplamı: ${sepetToplaminiHesapla()} TL`);
            dinamikUrunEkle();
        } else {
            console.log("Geçersiz ürün bilgisi!");
        }
    }
}

console.log(`\nMerhaba ${kullanici.isim}!`);
console.log("Kullanıcı Bilgileri:", kullanici);

sepetiListele();
console.log(`İlk sepet toplamı: ${sepetToplaminiHesapla()} TL`);

dinamikUrunEkle();

const urunCikarIsmi = prompt("Sepetten çıkarmak istediğiniz ürünün ismini girin:");
if (urunCikarIsmi) {
    urunCikar(urunCikarIsmi);
    sepetiListele();
    console.log(`Son toplam: ${sepetToplaminiHesapla()} TL`);
}