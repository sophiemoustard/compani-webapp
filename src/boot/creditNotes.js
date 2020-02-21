import creditNotes from 'src/core/api/CreditNotes'

export default ({ app, router, Vue }) => {
  Vue.prototype.$creditNotes = creditNotes;
}
