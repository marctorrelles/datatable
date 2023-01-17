import { VanillaExtractPlugin } from '@vanilla-extract/webpack-plugin'

module.exports = {
  webpack: {
    plugins: {
      add: [new VanillaExtractPlugin()],
    },
  },
}
