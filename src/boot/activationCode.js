import activationCode from '../api/ActivationCode'

export default ({ app, router, Vue }) => {
  Vue.prototype.$activationCode = activationCode;
}
