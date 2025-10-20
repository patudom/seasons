module.exports = {
  plugins: [
    process.env.NODE_ENV === 'production' 
      ? require('@fullhuman/postcss-purgecss')({
          content: [
            './src/**/*.html',
            './src/**/*.vue',
            './src/**/*.jsx'
          ],
          safelist: {
            standard: [/^v-/, /^mdi-/]
          }
        })
      : null
  ].filter(Boolean)
}