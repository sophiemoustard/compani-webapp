import creditNotes from '../api/CreditNotes'

export default ({ app, router, Vue }) => {
  Vue.prototype.$creditNotes = creditNotes;
}
