let BASE_URL = ''
if (import.meta.env.PORD) {
  BASE_URL = 'http://kuroneko.icu:8001'
} else {
  BASE_URL = '/api'
  // BASE_URL = 'http://localhost:8001'
}
export const TIME_OUT = 10000
export { BASE_URL }
