import activationCode from 'src/core/api/ActivationCode'

export default ({ app, router, Vue }) => {
  Vue.prototype.$activationCode = activationCode;
}
