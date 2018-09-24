<template>
  <v-container class="company-list pa-0">
    <v-layout row wrap>
      <v-flex
        xs12
        class="mb-2"
        v-for="(company, index) in companies"
        v-if="
          index >= (currentPage - 1) * numberItems &&
          index <= currentPage * numberItems
        "
        :key="index">
        <company-item
          :company="company"
          :reset-selected="resetSelected"
          @deleteCompany="onDeleteCompany"
          @editCompany="onEditCompany"
          @addSelectedCompany="onAddSelectedCompany">
        </company-item>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import CompanyItem from './companyItem';
import { mapGetters } from 'vuex';

export default {
  name: 'companyList',
  data () {
    return {
      resetSelected: false
    }
  },

  props: ['currentPage', 'numberItems', 'selectedCompanies', 'companies'],

  watch: {
    selectedCompanies: function (companies) {
      if (companies.length === 0) {
        this.resetSelected = true
      }
    }
  },

  methods: {
    onDeleteCompany: function (company) {
      this.$emit('deleteCompany', company)
    },
    onEditCompany: function (company) {
      this.$emit('editCompany', company)
    },
    onAddSelectedCompany: function (company, isSelected) {
      this.resetSelected = false
      this.$emit('addSelectedCompany', company, isSelected)
    }
  },
  components: {
    'company-item': CompanyItem
  }
}
</script>

<style scoped>
.company-list {
  width: 50%;
}
</style>
