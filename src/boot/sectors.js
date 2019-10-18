import sectors from '../api/Sectors'

export default ({ app, router, Vue }) => {
  Vue.prototype.$sectors = sectors;
}
