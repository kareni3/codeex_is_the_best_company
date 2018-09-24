import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    companies: []
  },
  mutations: {
    addCompany (state, params) {
      state.companies.push(params.company)
    },
    editCompany (state, params) {
      state.companies.forEach((arrCompany, i) => {
        if (arrCompany.inn === params.id) {
          state.companies.splice(i, 1, params.company)
        }
      })
    },
    deleteCompany (state, company) {
      state.companies.forEach((arrCompany, i, companies) => {
        if (arrCompany.inn === company.id) {
          companies.splice(i, 1)
        }
      })
    },
    deleteCompanies (companyIds) {
      // когда удаляется куча значений
      // не реализовал потому что нет времени на это
      // да, это 5 минут, ну и что
    },
    setCompanies (state, params) {
      state.companies = params.companies
    }
  },
  actions: {
    deleteCompany ({ commit, state }, params) {
      let companies = JSON.parse(localStorage.getItem('companies'))
      companies.forEach((arrCompany, i, companies) => {
        if (arrCompany.inn === params.id) {
          companies.splice(i, 1)
        }
      })
      localStorage.setItem('companies', JSON.stringify(companies))
      commit({
        type: 'deleteCompany',
        id: params.id
      })
    },
    addCompany ({ commit, state }, params) {
      let companies = JSON.parse(localStorage.getItem('companies'))
      companies.push(params.company)
      localStorage.setItem('companies', JSON.stringify(companies))
      commit({
        type: 'addCompany',
        company: params.company
      })
    },
    editCompany ({ commit, state }, params) {
      let companies = JSON.parse(localStorage.getItem('companies'))
      companies.forEach((arrCompany, i) => {
        if (arrCompany.inn === params.id) {
          companies.splice(i, 1, params.company)
        }
      })
      localStorage.setItem('companies', JSON.stringify(companies))
      commit({
        type: 'editCompany',
        company: params.company,
        id: params.id
      })
    },
    getCompaniesFromStrg ({ commit, state }) {
      let companies = JSON.parse(localStorage.getItem('companies'))
      commit({
        type: 'setCompanies',
        companies: companies
      })
    }
  },
  getters: {
    companies: state => {
      return state.companies
    },
    getNumberPages: state => numberItems => {
      return Math.ceil((state.companies.length) / numberItems)
    }
  }
})

export default store
