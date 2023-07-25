const { createProxyMiddleware } = require('http-proxy-middleware')
module.exports = function (app) {
  app.use(
    process.env.REACT_APP_API_URL ?? '',
    createProxyMiddleware({
      target: process.env.REDMINE_URL ?? '',
      changeOrigin: true,
      pathRewrite: {
        ['^' + process.env.REACT_APP_API_URL]: '' // remove base path
      }
    })
  )
}
