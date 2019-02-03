//base64 encode env-cmd files for CI with `base64 -i <in-file> -o <outfile>`
//https://superuser.com/a/883511
//https://support.circleci.com/hc/en-us/articles/360003540393-How-to-insert-files-as-environment-variables-with-Base64

const detectEnvironment = () => {
  if (process.env.CI) {
    switch (process.env.CI_ENV) {
      case 'dev':
        return 'NODE_PATH=./src env-cmd $DEV_REACT_VARS react-scripts start'
      case 'qa':
        return 'NODE_PATH=./src env-cmd $QA_REACT_VARS react-scripts start'
      default:
        return 'NODE_PATH=./src react-scripts start'
    }
  }
  if (process.env.LOCAL_ENV) {
    switch (process.env.LOCAL_ENV) {
      case 'dev':
        return 'NODE_PATH=./src env-cmd .env.dev react-scripts start'
      case 'qa':
        return 'NODE_PATH=./src env-cmd .env.qa react-scripts start'
      default:
        return 'NODE_PATH=./src react-scripts start'
    }
  }
  return 'NODE_PATH=./src react-scripts start'
}

module.exports = {
  server: {
    command: detectEnvironment(),
    port: 3000
  },
  launch: {
    dumpio: false,
    headless: process.env.HEADLESS !== 'false'
  },
  browserContext: 'default'
}