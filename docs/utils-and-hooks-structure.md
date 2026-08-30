# Utils ve Hooks Yapılandırması

## Yerel utils ve hooks Yapılandırması

Util fonksiyonlarını (`utils`) ve custom hook'ları (`hooks`) proje içinde nereye koyacağı sorusu çoğu zaman "hepsini `src/utils` veya `src/hooks` altına atma" alışkanlığıyla çözülür. Ancak proje büyüdükçe bu yaklaşım, yalnızca tek bir yerde kullanılan util veya custom hook'ların proje genelinde ortak bir alanda birikmesine ve bir util veya custom hook'un gerçekte nerede tüketildiğinin izlenemez hale gelmesine yol açar.

Bu doküman, hem util fonksiyonları hem de custom hook'lar için ortak iki ilkeyi tanımlar: **kullanıldığı yere yakın konumlandırma (colocation)** ve **tek sorumluluk**. Hem utils, hem hooks aynı yaklaşıma uyar; tek fark klasör adının (`utils` / `hooks`) ve isimlendirmenin (hook'lar `use` önekiyle başlar) farklı olmasıdır. Aşağıdaki örneklerin çoğu util üzerinden verilse de, aynı kurallar birebir custom hook'lar için de geçerlidir; bu nedenle metin boyunca ikisine birlikte atıfta bulunurken **util veya custom hook** ifadesi kullanılır.

### Özet

- Util veya custom hook, onu kullanan koda en yakın yerde konumlandırılmalı; erişim alanı gereksiz genişletilmemeli.
- Tek bileşen kullanıyorsa bileşenin `utils/` | `hooks/` klasörüne, aynı domain'de birden fazla bileşen kullanıyorsa en yakın ortak parent'a, birden fazla sayfada (cross-page) kullanılıyorsa `src/utils` | `src/hooks` altına yerleştirilir.
- Her dosya tek bir iş yapmalı; çok sayıda fonksiyon/hook toplayan dosyalar yerine konu bazlı grup klasörleri kullanılmalı.
- Bu sayede her util/hook dosyası, kendisine ait tek ve odaklı bir unit test dosyasıyla eşleşir.
- Hem hooks, hem de utils aynı yaklaşımı uygular.

---

## 1. Kullanıldığı Yere Yakın Konumlandır (Colocation)

Bir util veya custom hook'un konumu, onu kullanan koda göre belirlenir. İlke, util veya custom hook'u onu kullanan koda mümkün olan en yakın yerde tutmaktır. Böylece ilgili kodda refactor gerektiğinde nerelerin etkilenebileceği kolayca öngörülebilir ve devasa bir `src/utils` klasörünün oluşması engellenerek yapı daha dengeli tutulur.

Bu yaklaşımın en önemli faydalarından bir diğeri **temizlenebilirliktir**: bir util veya custom hook onu kullanan bileşene yakın konumlandırıldığında, o bileşenin silinmesi gerektiğinde ona ait util/hook ihtiyaçları da aynı klasörle birlikte kolayca kaldırılır. Util veya custom hook'lar `src/utils` veya `src/hooks` altında merkezi olarak biriktirildiğinde ise, bileşen silindikten sonra o util veya custom hook'un artık kullanılıp kullanılmadığını tespit etmek zorlaşır ve zamanla ölü koda (dead code) dönüşür.

Aynı yakınlık, bileşen **taşındığında** da avantaj sağlar: util veya custom hook bileşenle aynı klasörde durduğu için, bileşen başka bir yere taşındığında beraberinde gelir ve bileşenin ona verdiği `./utils` / `./hooks` gibi göreli (relative) import path'i değişmeden korunur. Merkezi `src/utils` / `src/hooks` altında dursaydı, bileşenin taşınmasıyla import path'lerinin ve buna bağlı olarak unit test dosyalarındaki mock yollarının da güncellenmesi gerekebilirdi.

### Yalnızca Tek Bir Bileşen Kullanıyorsa

Bir util veya custom hook yalnızca tek bir bileşenin içinde kullanılıyorsa, ilgili bileşenin klasörü içinde bir `utils/` (hook ise `hooks/`) klasörü açılır ve oraya yerleştirilir. Tüm util veya custom hook'lar `src/utils` / `src/hooks` altına koyulursa, kapsamları gereksiz yere genişler ve zamanla bu klasörler şişer.

```text
components/
  AccountDetail/
    index.tsx
    style.module.scss
    utils/
      formatAccountNumber.ts    # yalnızca AccountDetail kullanıyor
    hooks/
      useAccountDetail.ts       # yalnızca AccountDetail kullanıyor
```

### Aynı Domain'de Birden Fazla Bileşen Kullanıyorsa → En Yakın Ortak Parent'a Taşı

Bir util veya custom hook, aynı domain içindeki birden fazla bileşen tarafından tüketilmeye başlandığında, artık tek bir bileşene ait değildir. Bu durumda, tüketen bileşenlerin **en yakın ortak parent klasörüne** taşınır. Paylaşım aynı domain içinde çok sayıda bileşene yayılıyorsa, doğrudan domain'in kök bileşeninin altında (`components/ComponentName/utils/*`) da konumlandırılabilir.

```text
components/
  AccountDetail/
    index.tsx
    utils/
      formatAccountNumber.ts    # AccountDetail ve child bileşeni birlikte
    TransactionList/
      index.tsx                 # formatAccountNumber'ı buradan da kullanıyor
```

Yukarıda `formatAccountNumber`, hem `AccountDetail` hem de child bileşeni `TransactionList` tarafından kullanıldığından, ikisinin de erişebildiği en yakın ortak nokta olan `AccountDetail/utils` altında konumlanır.

### Birden Fazla Sayfada (Cross-Page) Kullanılıyorsa → `src/utils` veya `src/hooks`

Bir util veya custom hook yalnızca tek bir sayfaya ait olmaktan çıkıp birden fazla sayfada kullanılmaya başlandığında, artık belirli bir bileşene ya da onun alt ağacına ait değildir; proje geneline ait ortak bir yapıdır. **Yalnızca bu cross-page (sayfalar arası) ihtiyaç doğduğunda** `src/utils` (hook ise `src/hooks`) altına taşınır. Bu klasörler, sayfalar arasında gerçekten paylaşılan util veya custom hook'ların yeridir.

```text
src/
  utils/
    formatAccountNumber.ts      # birden fazla sayfada kullanılıyor
  hooks/
    useDebounce.ts              # birden fazla sayfada kullanılıyor
```

### Karar Özeti

| Kullanan | Konum |
| :--- | :--- |
| **Tek bir bileşen** | `ComponentFolder/utils/` \| `ComponentFolder/hooks/` |
| **Aynı domain'de birden fazla bileşen** | En yakın ortak parent'ın `utils/` \| `hooks/` klasörü |
| **Birden fazla sayfa (cross-page)** | `src/utils/` \| `src/hooks/` |

Bu yaklaşım, bir util veya custom hook'un erişim alanını olabildiğince dar tutar. Bir bileşen kaldırıldığında yalnızca ona ait olanlar da onunla birlikte kaldırılır; `src/utils` ve `src/hooks` yalnızca sayfalar arası gerçekten paylaşılan util veya custom hook'ları barındırır ve bir util veya custom hook'un kapsamı konumundan anlaşılır. Ayrıca bu klasörler çok şişmeyeceği için, sayfalarda artık ihtiyaç kalmayan ölü util veya custom hook'ları görmek de kolaylaşır.

### Domain'den Bağımsız Genel Util'ler → `src/utils/common`

Bazı util'ler herhangi bir domaine ya da iş mantığına bağlı değildir; girdiye göre saf (pure) bir sonuç üreten, projeden projeye taşınabilecek genel amaçlı util'lerdir. `isNullOrEmpty`, `isString`, `isNumber` veya çeşitli `date` utility'leri gibi tip/değer kontrolleri buna örnektir. Bu tür util'ler uygun klasörleme ile `src/utils/common` altında veya örneğin date için `src/utils/date/*` altında toplanabilir. Böylece her bir utility'e ait unit test dosyası da ayrı şekilde yazılabilir.

```text
src/
  utils/
    common/
      __tests__/{utilName}.ts
      isNullOrEmpty.ts
      isString.ts
      isNumber.ts
    date/
      __tests__/{utilName}.ts
      parseIsoToDate.ts
      getCurrentDateInFormat.ts
```

`common`, içinde hiçbir domain bilgisi barındırmayan bu saf fonksiyonları, iş mantığına özgü diğer paylaşılan util'lerden ayrı tutar.

---

## 2. Her Dosya Tek Bir İş Üstlenir

Bir util ya da hook dosyası tek bir işi yapmalıdır. İçinde çok sayıda ilgisiz fonksiyon barındıran `dateUtils.ts`, `helpers.ts` gibi toplayıcı dosyalardan (ya da onlarca ilgisiz hook'u tek dosyada toplayan yapılardan) kaçınılmalıdır.

**Kaçınılması gereken kullanım — tek dosyada çok sayıda iş:**

```typescript
// src/utils/dateUtils.ts - Önerilmez
export const formatDate = (date: Date) => {
  /* ... */
};

export const getDayDiff = (a: Date, b: Date) => {
  /* ... */
};

export const isWeekend = (date: Date) => {
  /* ... */
};

export const addBusinessDays = (date: Date, days: number) => {
  /* ... */
};

// ... çok sayıda fonksiyon daha
```

Bunun yerine, aynı konuya ait util veya custom hook'lar için bir **grup klasörü** açılır ve her dosya tek bir işi üstlenir:

```text
src/
  utils/
    date/
      formatDate.ts
      getDayDiff.ts
      isWeekend.ts
      addBusinessDays.ts
```

```typescript
// src/utils/date/formatDate.ts
export const formatDate = (date: Date) => {
  /* ... */
};
```

Aynı ilke yerel util veya custom hook'lar için de geçerlidir; bir bileşenin `utils/` (veya `hooks/`) klasörü de konu bazlı gruplanabilir:

```text
components/
  AccountDetail/
    index.tsx
    utils/
      formatAccountNumber.ts
      iban/
        maskIban.ts
        maskCardNumber.ts
        isIbanValid.ts
```

### Tek İş, Aynı Dosyada Helper Fonksiyonlar

"Tek iş" ilkesi, bir dosyada yalnızca tek bir fonksiyon bulunması gerektiği anlamına gelmez. Bir işi yerine getiren ana fonksiyon (ya da hook) bazen büyüyebilir; böyle durumlarda yalnızca o ana fonksiyona hizmet eden helper fonksiyonlar aynı dosya içinde tanımlanabilir. Bu helper'lar dışa aktarılmaz (export edilmez); sadece dosyanın kendi içindeki okunabilirliği ve sorumluluk ayrımını iyileştirmek için vardır.

```typescript
// src/utils/calculateBalance.ts
const getData = () => {
  /* ... */
};

const formatData = (data: RawBalance) => {
  /* ... */
};

export const calculateBalance = () => {
  const current = getData();
  // ...
  const formatted = formatData(current);
  return formatted;
};
```

Yukarıdaki dosya hâlâ tek bir işi (`calculateBalance`) üstlenir. `getData` ve `formatData` yalnızca bu işe ait iç adımlardır ve dışarıya açılmadıkları için dosyanın sorumluluğunu değiştirmez. Bu yapı geçerlidir; bir dosyanın "tek iş" ilkesini bozan durum, birbirinden bağımsız **birden fazla dışa aktarılan (exported) işin** aynı dosyada toplanmasıdır. Aynı mantık hook'lar için de geçerlidir: bir hook, yalnızca kendisine hizmet eden ve dışarı açılmayan helper fonksiyonları aynı dosyada barındırabilir.

### İşe Ait Tipler ve Sabitler

Her util veya custom hook dosyası tek bir işi üstlendiği için, bu dosyalarda ihtiyaç duyulan sabitler ve tipler de genellikle karmaşıklaşmaz. Bu sayede yalnızca o işe ait tip ve sabitler de aynı dosyada tanımlanabilir; yalnızca bu dosyada kullanıldıkları sürece ayrı bir `constants` veya `types` dosyası oluşturmaya gerek kalmaz. Bir tip ya da sabit birden fazla iş tarafından paylaşılmaya başlandığında ise, util/hook'ların kendisinde olduğu gibi en yakın ortak parent'a taşınır.

---

## 3. Neden Tek Sorumluluk?

Her dosyanın tek bir işi üstlenmesi; bakımı, sürdürülebilirliği, genişletilebilirliği, test edilebilirliği ve değişken/tip yönetimini iyileştirir. En belirgin fayda test tarafında görülür: her dosya tek bir işi yaptığında, o dosyaya karşılık **tek bir unit test dosyası** oluşturulur ve bu test dosyası yalnızca o işi kapsar.

```text
src/
  utils/
    date/
      __tests__/
        formatDate.ts       # yalnızca formatDate'i test eder
        getDayDiff.ts       # yalnızca getDayDiff'i test eder
      formatDate.ts
      getDayDiff.ts
```

Aksi halde tek bir `dateUtils.ts` içine çok sayıda iş toplandığında, buna karşılık gelen unit test dosyası da tüm bu işlerin testini barındırmak zorunda kalır. Her fonksiyon için ortalama 8-10 test yazıldığı düşünülürse, test dosyası hızla büyür; hangi testin hangi fonksiyona ait olduğunu bulmak, dosyayı okumak ve bakımını yapmak zorlaşır; bir fonksiyondaki değişiklik ilgisiz onlarca testin arasında takip edilmesi güç hale gelir. Tek sorumluluk ilkesi, hem util/hook dosyalarını hem de onlara karşılık gelen test dosyalarını küçük, odaklı ve sürdürülebilir tutar.

Ayrıca bu yapı, süreçlere giderek daha fazla dahil olan AI agent'ları açısından da context window kullanımını iyileştirir: bir agent ihtiyaç duyduğu fonksiyonu ararken çok daha küçük dosyalar okur ve 10 satırlık bir fonksiyon için 300 satırlık bir dosyanın tamamını context'e yüklemek gerekmez.
