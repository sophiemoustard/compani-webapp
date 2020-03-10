import Programs from '@api/Programs';

export const getProgram = async ({ commit }, params) => {
  try {
    const program = await Programs.getById(params.programId);
    commit('saveProgram', program);
  } catch (e) {
    console.error(e);
  }
};
