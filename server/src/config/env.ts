import dotenv from 'dotenv'

dotenv.config({ quiet: true })

const isProduction = process.env.NODE_ENV === 'production'

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET

  if (secret && secret.trim().length > 0) {
    return secret
  }

  if (isProduction) {
    // Production'da varsayılan/sabit bir secret ile çalışmak, token sahteciliğine
    // (örn. sahte admin token'ı üretmeye) izin verir. Bu yüzden burada uygulamayı
    // başlatmıyoruz; .env dosyasına güçlü bir JWT_SECRET eklenmesi zorunludur.
    throw new Error(
      'JWT_SECRET ortam değişkeni tanımlı değil. Lütfen .env dosyasına güçlü bir JWT_SECRET ekleyin.',
    )
  }

  console.warn(
    '[uyarı] JWT_SECRET tanımlı değil, sadece geliştirme ortamı için geçici bir secret kullanılıyor. ' +
      'Production ortamına geçmeden önce .env dosyanıza güçlü bir JWT_SECRET eklemeyi unutmayın.',
  )
  return 'dev_only_insecure_secret_do_not_use_in_production'
}

export const JWT_SECRET = getJwtSecret()
