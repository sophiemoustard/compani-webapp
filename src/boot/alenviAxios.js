import { alenviAxios } from 'src/core/api/ressources/alenviAxios'

export default ({ app, router, Vue }) => {
  Vue.prototype.$alenviAxios = alenviAxios;
}
