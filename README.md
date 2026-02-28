# eslint-eg-rules

Bu depo, projenizde kullanabileceğiniz özel ESLint kurallarını içermektedir.

## Proje Yapısı

- **`src/rules/`**: Tüm özel kurallarımız bu klasör altınında her biri ayrı bir klasör olacak şekilde bulunmaktadır. Örneğin: `src/rules/example-rule/index.ts`
- **`src/index.ts`**: Plugin'in dışa aktardığı kuralların ve tavsiye edilen (recommended) configürasyonun tanımlandığı ana dosyadır.
- **`demo/`**: Kuralların deneyimlenebilmesi ve test edilebilmesi için hazırlanmış Vite, React 18+ ve TypeScript destekli demo projesidir. Bu proje sadece bu depodaki plugin'i kullanacak şekilde yapılandırılmıştır.

## Kurulum ve Derleme (Geliştirme İçin)

Projenin derlenmesi ve demoda test edilebilmesi için aşağıdaki adımları uygulayın:

1. Kök dizinde bağımlılıkları kurun:
   ```bash
   npm install
   ```

2. Plugin projesini derleyin:
   ```bash
   npm run build
   ```

3. Demo projesine geçin ve bağımlılıkları kurun (Plugin projeden yerel olarak linklenmiştir):
   ```bash
   cd demo
   npm install
   ```

## Yeni Kural Ekleme

1. `src/rules/` içerisine yeni bir klasör oluşturun (örneğin: `my-new-rule`).
2. ESLint yapısına uygun kuralınızı yazın.
3. Kuralınızı `src/index.ts` dosyasındaki `rules` ve `configs` içerisine ekleyin.
4. Kök dizindeki `npm run build` komutunu çalıştırarak plugin'i güncelleyin.
5. Demo projesinde (`demo`) bu kuralın çalıştığını test edin (Gerekliyse `npm run lint` komutunu kullanabilirsiniz).
