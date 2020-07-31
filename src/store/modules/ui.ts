import Vue from 'vue';
import lock from '@/helpers/lock';
import config from '@/helpers/config';
import { lsGet } from '@/helpers/utils';

const state = {
  init: false,
  loading: false,
  address: '',
  name: '',
  balances: {},
  pools: [],
  totalMarketcap: 0,
  totalVolume1Day: 0,
  sharesOwned: [],
  poolsById: {},
  proxy: '',
  sidebarIsOpen: false
};

const mutations = {
  SET(_state, payload) {
    Object.keys(payload).forEach(key => {
      Vue.set(_state, key, payload[key]);
    });
  }
};

const actions = {
  init: async ({ commit, dispatch }) => {
    commit('SET', { loading: true });
    const tokenIds = Object.keys(config.tokens)
      .map(tokenAddress => config.tokens[tokenAddress].id)
      .filter(tokenId => !!tokenId);
    await Promise.all([
      dispatch('getBalancer'),
      dispatch('loadPricesById', tokenIds),
      dispatch('initTokenMetadata')
    ]);
    await dispatch('loadBackupProvider');
    const connector = lsGet('connector');
    if (Object.keys(config.connectors).includes(connector)) {
      const lockConnector = lock.getConnector(connector);
      const isLoggedIn = await lockConnector.isLoggedIn();
      if (isLoggedIn) await dispatch('login', connector);
    }
    commit('SET', { loading: false, init: true });
  },
  loading: ({ commit }, payload) => {
    commit('SET', { loading: payload });
  },
  toggleSidebar: ({ commit }) => {
    commit('SET', { sidebarIsOpen: !state.sidebarIsOpen });
  },
  hideSidebar: ({ commit }) => {
    commit('SET', { sidebarIsOpen: false });
  }
};

export default {
  state,
  mutations,
  actions
};
