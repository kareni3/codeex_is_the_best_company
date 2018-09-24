<template>
  <v-card>
    <v-card-title>
      <v-layout justify-center>
        Удалить компанию {{ company.name }}?
      </v-layout>
    </v-card-title>
    <v-card-actions>
      <v-layout
        row
        wrap>
        <v-flex xs6>
          <v-btn
            block
            color="green darken-4"
            flat="flat"
            @click="close">
            Нет
          </v-btn>
        </v-flex>
        <v-flex xs6>
          <v-btn
            block
            color="red darken-4"
            flat="flat"
            @click="deleteCompany">
            Да
          </v-btn>
        </v-flex>
      </v-layout>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  data () {
    return {}
  },
  props: ['company'],
  methods: {
    close: function () {
      this.$emit('closeDialog')
    },
    deleteCompany: function () {
      this.$emit('deleteCompany', this.company)
    }
  }
}
</script>
