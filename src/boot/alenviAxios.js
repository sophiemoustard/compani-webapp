import { alenviAxios } from '../api/ressources/alenviAxios'

export default ({ app, router, Vue }) => {
  Vue.prototype.$alenviAxios = alenviAxios;
}
