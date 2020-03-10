import Company from '@api/Companies';

export const getCompany = async ({ commit }, params) => {
  try {
    const company = await Company.getById(params.companyId);
    commit('saveCompany', company);
  } catch (e) {
    console.error(e);
  }
}
