import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/components/Home'
import Companies from '@/components/companyPage/companyPage'

import Error404 from '@/components/errors/Error404'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [{
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/companies/:id',
    name: 'companyList',
    component: Companies
  },
  {
    path: '/*',
    name: '404',
    component: Error404
  }
  ]
})
