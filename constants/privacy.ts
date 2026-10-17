/**
 * Aydınlatma metni (KVKK) – burada düzenlenir.
 * NOT: Bu metin bir taslaktır. Yayınlamadan / başkalarına dağıtmadan önce bir hukukçuya okutman önerilir.
 */
export const PRIVACY_VERSION = '1';

export const PRIVACY_SECTIONS: Array<{ title: string; body: string }> = [
  {
    title: 'Kısaca',
    body: 'Planım, LGS çalışmanı takip etmene yardım eder. Bilgilerin yalnızca bu cihazda saklanır. Uygulama bir sunucuya veri göndermez ve hiçbir yere kendiliğinden rapor yollamaz.',
  },
  {
    title: 'Hangi bilgiler işlenir?',
    body:
      '• Adın, sınav tarihin, hedef lisen ve hedef netin\n' +
      '• Ders programın, deneme ve soru sonuçların, eksik konuların, yanlış yaptığın sorular\n' +
      '• Ders sırasında hangi uygulamanın kaç dakika açıldığı (yalnızca uygulama adı ve süre)\n' +
      '• Telefonda yüklü uygulamaların listesi (kilitleyeceklerini seçebilmen için)\n' +
      '• Spotify\'a bağlanırsan Spotify hesap adın ve playlist\'lerin (sadece müzik seçmek için)',
  },
  {
    title: 'Hangi bilgiler işlenmez?',
    body: 'Mesajların, fotoğrafların, konumun, rehberin ve diğer uygulamaların içindeki hiçbir şey okunmaz. Sadece hangi uygulamanın açık olduğu bilinir.',
  },
  {
    title: 'Ne için kullanılır?',
    body: 'Ders alarmları, ders sırasında seçtiğin uygulamaların kilitlenmesi, günlük hedeflerin takibi ve senin isteğinle paylaşabileceğin PDF raporlar için.',
  },
  {
    title: 'Raporlar ve paylaşım',
    body: 'Raporlar PDF olarak oluşturulur. Paylaşıp paylaşmayacağına ve kime göndereceğine sen karar verirsin. Uygulama raporu kendiliğinden hiç kimseye göndermez.',
  },
  {
    title: 'Haklarını nasıl kullanırsın?',
    body: 'Verilerin cihazında durduğu için Ayarlar > "Tüm verilerimi sil" ile hepsini istediğin an silebilirsin. İzinleri telefonun Ayarlar bölümünden istediğin zaman kapatabilirsin. 6698 sayılı KVKK kapsamındaki haklarından (bilgi alma, düzeltme, silme) yararlanabilirsin.',
  },
  {
    title: 'Reşit olmayanlar için',
    body: '18 yaşından küçükler için bu onayı ebeveyn veya yasal vasi vermelidir.',
  },
];
