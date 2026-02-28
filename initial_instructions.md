# eslint-eg-rules
Bu proje frontend için özel eslint kuralları tanımlamak amacıyla oluşturulmuştur. Burada yazılan kurallar ESLint paketi tarafından plugin olarak kullanılıp projelerde kullanılacaktır.

## LLM'e İletilecek Talimatlar

### 1. Proje Yapısı
Proje, ESLint plugin yapısına uygun olarak oluşturulmalıdır. Paketleyicisi ve configürasyonda bu yapıya uygun olarak ayarlanmalıdır.

### 2. Kurallar
Her kural, ayrı bir klasörde tanımlanmalıdır. Kurallar, ESLint plugin yapısına uygun olarak oluşturulmalıdır.

### 3. Demo Projesi
Kuralların test edilebilmesi için demo projesi oluşturulmalıdır. Demo projesi react 18+ ve typescript destekli bir proje olacak, ESLint plugin yapısına uygun olarak oluşturulmalıdır. sadece bizim ana librarymizde yaptıgımız eslint kuralları aktif olmalıdır. Aşağıdaki dizinde bulunmalıdır:

```
src/demo/
```

Demo projesinin ve ana librarynin config dosyalarının ayarlarının birbirini etkilemediğinden emin olunmalıdır.

