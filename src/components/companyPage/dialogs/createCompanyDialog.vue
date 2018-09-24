<template>
  <v-card>
    <v-card-title
      @click="hideSelectList">
      <v-layout justify-center>
        <v-flex xs12>
          <v-form v-model="valid">
            <v-text-field
              v-model="newCompany.name"
              :rules="nameRules"
              label="Название компании"
              required
              @keyup="openSelectList"
              @click="stopEvent"
            ></v-text-field>
            <v-list
              dense
              v-if="isOpenSelectList"
              class="select-list elevation-2">
              <v-list-tile
                v-for="(company, i) in companies"
                :key="i"
                @click="selectItem(company, i)">
                <v-list-tile-title>
                  {{ company.name }}
                </v-list-tile-title>
              </v-list-tile>
            </v-list>
            <v-text-field
              v-model="newCompany.inn"
              :rules="innRules"
              label="ИНН"
              :counter="12"
              required
              @keydown="validationINN"
            ></v-text-field>
            <v-text-field
              v-model="newCompany.director.fio"
              :rules="fioRules"
              label="ФИО руководителя"
              required
            ></v-text-field>
          </v-form>
        </v-flex>
      </v-layout>
    </v-card-title>
    <v-card-actions
      @click="hideSelectList">
      <v-layout>
        <v-flex xs6>
          <v-btn
            block
            color="red darken-4"
            flat="flat"
            @click="close">
            Отмена
          </v-btn>
        </v-flex>
        <v-flex xs6>
          <v-btn
            block
            color="green darken-4"
            flat="flat"
            @click="createCompany">
            Готово
          </v-btn>
        </v-flex>
      </v-layout>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  data () {
    return {
      companies: [],
      isServerTimeOut: false,
      isOpenSelectList: false,
      currentNameNum: 0,
      newCompany: {
        inn: '',
        name: '',
        director: {
          id: 0,
          fio: ''
        }
      },
      valid: false,
      nameRules: [v => !!v || 'Заполните название компании'],
      innRules: [
        v => !!v || 'Заплоните ИНН',
        v => /^[0-9]+$/.test(v) || 'Используйте цифры',
        v => (v.length <= 12 && v.length >= 10) || '10-12 символов'
      ],
      fioRules: [
        v => !!v || 'Запоните ФИО руководителя',
        v => /^[a-zA-ZА-Я-а-яёЁ /.]+$/.test(v) || 'Используйте буквы'
      ]
    }
  },

  props: ['company'],

  watch: {
    company: function (company) {
      if (company.inn) {
        this.newCompany.inn = company.inn
        this.newCompany.name = company.name
        this.newCompany.director.fio = company.director.fio
      } else {
        this.newCompany = {
          inn: '',
          name: '',
          director: {
            id: 0,
            fio: ''
          }
        }
      }
    }
  },

  methods: {
    close: function () {
      this.$emit('closeDialog')
    },
    createCompany: function () {
      if (!this.valid) return
      this.newCompany.inn = this.newCompany.inn.trim()
      this.newCompany.name = this.newCompany.name.trim()
      this.newCompany.director.fio = this.newCompany.director.fio.trim()
      if (!this.company.inn) {
        this.$emit('createCompany', this.newCompany)
      } else {
        this.$emit('editCompany', this.newCompany, this.company.inn)
      }
    },
    validationINN: function (event) {
      if (isNaN(+event.key) && event.key.length === 1) {
        event.preventDefault()
      }
      if (this.newCompany.inn.length >= 12 && event.key.length === 1) {
        event.preventDefault()
      }
    },
    selectItem: function (item, i) {
      this.currentNameNum = i
      this.newCompany.name = this.companies[i].name
      this.newCompany.inn = this.companies[i].inn
      this.newCompany.director.fio = this.companies[i].director.fio
      this.hideSelectList()
    },
    openSelectList: function (event) {
      if (this.newCompany.name.length < 2) return
      if (this.isServerTimeOut) return

      setTimeout(() => {
        this.isServerTimeOut = false
        if (!this.isOpenSelectList) this.openSelectList()
      }, 500)
      this.isServerTimeOut = true

      let entityMap = {
        '&': '38 ',
        '<': '60 ',
        '>': '62 ',
        '"': '34 ',
        "'": '39 ',
        '/': '47 ',
        '`': '96 ',
        '=': '61 '
      }

      function escapeHtml (string) {
        return String(string).replace(/[&<>"'`=\/]/g, function (s) {
          return entityMap[s]
        })
      }

      var xhr = new XMLHttpRequest()
      var body = `{ "query": "${escapeHtml(this.newCompany.name)}" }`
      xhr.open(
        'POST',
        'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party',
        true
      )
      xhr.setRequestHeader('Content-Type', 'application/json')
      xhr.setRequestHeader('Accept', 'application/json')
      xhr.setRequestHeader(
        'Authorization',
        'Token 3537e0694267e151423173067727fc16a5bf5d31'
      )
      xhr.send(body)
      xhr.onreadystatechange = () => {
        if (xhr.readyState != 4) return
        if (xhr.status != 200) {
          console.log(xhr.status + ': ' + xhr.statusText)
        } else {
          let companies = JSON.parse(xhr.responseText).suggestions
          this.companies = []
          for (let i = 0; i < companies.length && i < 5; i++) {
            let newCompany = {
              inn: companies[i].data.inn,
              name: companies[i].value,
              director: {
                id: 0,
                fio: companies[i].data.management
                  ? companies[i].data.management.name
                  : ''
              }
            }
            this.companies[i] = newCompany
          }
          if (companies.length > 0) this.isOpenSelectList = true
          if (companies.length == 0) this.isOpenSelectList = false
        }
      }
    },
    hideSelectList: function (event) {
      this.isOpenSelectList = false
    },
    stopEvent: function (event) {
      event.stopPropagation()
    }
  }
}
</script>

<style scoped>
.select-list {
  position: absolute;
  top: 66px;
  background-color: white;
  min-width: 90%;
  z-index: 20;
}
</style>
