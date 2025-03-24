import path from 'path'

export function chainWebpack(config) {
  // eslint-disable-next-line no-undef
  config.resolve.alias.set('@', path.resolve(__dirname, 'src')).set('views', '@/views')
}
