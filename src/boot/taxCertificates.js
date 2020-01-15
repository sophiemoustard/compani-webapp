import taxCertificates from '../api/TaxCertficates';

export default ({ app, router, Vue }) => {
  Vue.prototype.$taxCertificates = taxCertificates;
}
