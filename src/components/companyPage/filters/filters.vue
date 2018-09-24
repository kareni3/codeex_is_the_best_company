<template>
  <v-container class="filters pa-0">
    <v-layout row align-center justify-center>
      <v-flex xs3>
        <v-menu
          open-on-hover
          absolute
          :nudge-bottom="40">
          <v-btn
            class="sort-btn"
            slot="activator">
            Сортировать
            <v-icon class="pl-1">arrow_drop_down</v-icon>
          </v-btn>
          <v-list>
            <v-list-tile
              v-for="(sort, i) in sorts"
              :key="i"
              @click="selectItem(sort, i)">
              <v-list-tile-title>
                {{ sort.title }}
              </v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-menu>
      </v-flex>
      <v-flex xs3>
        <v-switch
          :label="ascending ? 'По возрастанию' : 'По убыванию'"
          v-model="ascending"
          class="ml-4">
        </v-switch>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: 'filters',
  data () {
    return {
      sorts: [
        { title: 'Название компании', sort: 'name' },
        { title: 'ИНН', sort: 'inn' },
        { title: 'Руководитель', sort: 'director.fio' }
      ],
      currentSort: {},
      ascending: true,
      selected: 0
    }
  },

  watch: {
    ascending: function (value) {
      this.$emit('sortCompanies', this.currentSort.sort, value ? 1 : -1)
    }
  },

  mounted () {
    this.menuItems = this.$children[0].$el.children[1].children[0]
    this.selectItem(this.sorts[0], this.selected)
  },

  methods: {
    selectItem: function (item, i) {
      if (item.sort === this.currentSort.sort) return
      this.$emit('sortCompanies', item.sort, this.ascending ? 1 : -1)
      this.currentSort = item
      this.menuItems.children[
        this.selected
      ].children[0].children[0].classList.remove('green--text')
      this.menuItems.children[i].children[0].children[0].classList.add(
        'green--text'
      )
      this.selected = i
    }
  }
}
</script>

<style scoped>
.sort-btn {
  height: 30px;
}
</style>
