import Company from '@api/Companies';

export async function getCompany ({ commit }, params) {
  try {
    const company = await Company.getById(params.companyId);
    commit('saveCompany', company);
  } catch (e) {
    console.error(e);
  }
}
