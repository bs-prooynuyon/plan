/**
 * PLANIM – tek yerden ayarlar.
 * Sonradan elle değiştireceğin her şey burada. Değiştirince APK'yı yeniden derle.
 */
export const CONFIG = {
  /**
   * Hesap (e-posta ile giriş) + cihazlar arası eşitleme için Supabase bilgileri (SUPABASE_KURULUM.md).
   * Boş bırakılırsa uygulama hesapsız (yalnızca bu telefonda) çalışır.
   */
  supabaseUrl: '',
  supabaseAnonKey: '',
  /** Eski Supabase yapay zeka fonksiyonu adı (artık kullanılmıyor; yapay zeka Gemini anahtarıyla çalışır). */
  aiFunction: 'planim-ai',

  /** Yapay zeka (Gemini) modeli. Anahtarı kullanıcı Ayarlar > Yapay zeka'dan kendisi ekler. */
  geminiModel: 'gemini-3.8-flash',

  /** Spotify Developer Dashboard > Client ID. Boş bırakılırsa uygulama bağlarken ister. */
  spotifyClientId: '',

  /**
   * "Yaygın uygulamalar" listesi. Ders sırasında kilitlenecekler için hızlı seçim.
   * Telefonda yüklü olanlar tek dokunuşla işaretlenir. pkg = Android paket adı.
   */
  commonDistractionApps: [
    { pkg: 'com.instagram.android', label: 'Instagram' },
    { pkg: 'com.zhiliaoapp.musically', label: 'TikTok' },
    { pkg: 'com.ss.android.ugc.trill', label: 'TikTok' },
    { pkg: 'com.google.android.youtube', label: 'YouTube' },
    { pkg: 'com.snapchat.android', label: 'Snapchat' },
    { pkg: 'com.twitter.android', label: 'X (Twitter)' },
    { pkg: 'com.facebook.katana', label: 'Facebook' },
    { pkg: 'com.pinterest', label: 'Pinterest' },
    { pkg: 'com.netflix.mediaclient', label: 'Netflix' },
    { pkg: 'com.roblox.client', label: 'Roblox' },
    { pkg: 'com.supercell.brawlstars', label: 'Brawl Stars' },
    { pkg: 'com.mojang.minecraftpe', label: 'Minecraft' },
    { pkg: 'com.pubg.imobile', label: 'PUBG' },
    { pkg: 'com.kiloo.subwaysurf', label: 'Subway Surfers' },
  ],

  /** "Arkadaşımla çalışıyorum" için varsayılan izinli uygulamalar. */
  friendStudyDefaults: [
    'com.whatsapp',
    'com.google.android.apps.tachyon', // Google Meet / Duo
    'us.zoom.videomeetings',
    'org.telegram.messenger',
  ],

  /** Müzik uygulamaları ders sırasında kilitlenmez (müzik çalmaya devam etsin). */
  musicApps: ['com.spotify.music', 'com.google.android.apps.youtube.music'],

  /** Dersin bitişinden önce kilit kendiliğinden kalkmaz; sadece bu kadar saniye "erken bitir" basılı tutulur. */
  earlyFinishHoldMs: 2500,
};
