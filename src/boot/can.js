import { can } from '../helpers/acl/can';

export default ({ app, router, Vue }) => {
  Vue.prototype.$can = can;
}
