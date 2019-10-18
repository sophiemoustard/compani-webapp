import thirdPartyPayers from '../api/ThirdPartyPayers'

export default ({ app, router, Vue }) => {
  Vue.prototype.$thirdPartyPayers = thirdPartyPayers;
}
