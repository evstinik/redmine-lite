// index.js

export const onPreBuild = function ({ netlifyConfig }) {
  // Replace placeholder in redirect
  netlifyConfig.redirects.forEach((redirect) => {
    redirect.to = redirect.to.replace('REDMINE_URL_PLACEHOLDER', process.env.REDMINE_URL)
  })
}
