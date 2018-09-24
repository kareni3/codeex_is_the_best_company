<template>
  <div class="companyPage">
    <filters
      class="mt-3 px-4"
      @sortCompanies="sortCompanies">
    </filters>
    <company-list
      class="company-list-margin"
      :companies="sortedCompanies()"
      :number-items="numberItems"
      :current-page="currentPage"
      :selected-companies="selectedCompanies"
      @deleteCompany="showDeleteCompanyDialog"
      @addSelectedCompany="addSelectedCompany"
      @editCompany="showCreateCompanyDialog">
    </company-list>
    <v-layout justify-center>
        <navigation
          :number-pages="numberPages"
          :current-page="currentPage"
          @nextPage="nextPage"
          @prevPage="prevPage"
          @goToPage="goToPage">
        </navigation>
    </v-layout>
    <v-layout row justify-center>
      <v-layout row class="delete-btns">
        <v-flex xs9>
          <v-btn
            block
            large
            v-if="showDeleteSelectedBtn"
            color="red lighten-1"
            class="white--text"
            @click="showDeleteCompaniesDialog">
            Удалить ({{selectedCompanies.length}})
            <v-icon class="pl-1">delete_outline</v-icon>
          </v-btn>
        </v-flex>
        <v-flex xs3 class="ml-2">
          <v-btn
            block
            large
            v-if="showDeleteSelectedBtn"
            color="blue accent-1"
            class="white--text px-2 cancel-btn"
            @click="resetSelectedCompanies">
            <v-icon class="pl-1">cancel</v-icon>
          </v-btn>
        </v-flex>
      </v-layout>
    </v-layout>
    <v-btn
      fab
      large
      color="blue accent-1"
      class="white--text create-btn"
      @click="showCreateCompanyDialog">
      <v-icon dark>add</v-icon>
    </v-btn>
    <v-dialog v-model="isShowDeleteCompanyDialog" max-width="350">
      <delete-company-dialog
        :company="companyToDelete"
        @closeDialog="closeDeleteCompanyDialog"
        @deleteCompany="deleteCompany">
      </delete-company-dialog>
    </v-dialog>
    <v-dialog v-model="isShowDeleteCompaniesDialog" max-width="350">
      <delete-companies-dialog
        :companies="selectedCompanies"
        @closeDialog="closeDeleteCompaniesDialog"
        @deleteCompanies="deleteCompanies">
      </delete-companies-dialog>
    </v-dialog>
    <v-dialog v-model="isShowCreateCompanyDialog" max-width="350">
      <create-company-dialog
        :company="companyToEdit"
        @closeDialog="closeCreateCompanyDialog"
        @createCompany="createCompany"
        @editCompany="editCompany">
      </create-company-dialog>
    </v-dialog>
  </div>
</template>

<script>
import CompanyList from './companyList/companyList';
import Navigation from './navigation/navigation';
import DeleteCompanyDialog from './dialogs/deleteCompanyDialog';
import DeleteCompaniesDialog from './dialogs/deleteCompaniesDialog';
import CreateCompanyDialog from './dialogs/createCompanyDialog';
import Filters from './filters/filters';
import { mapGetters } from 'vuex';

export default {
  name: 'companyPage',
  data () {
    return {
      numberPages: 0,
      numberItems: 50,
      currentPage: 1,
      isShowDeleteCompanyDialog: false,
      companyToDelete: {},
      companyToEdit: {},
      selectedCompanies: [],
      showDeleteSelectedBtn: false,
      isShowDeleteCompaniesDialog: false,
      isShowCreateCompanyDialog: false,
      sortParams: {
        sort: '',
        direction: ''
      }
    }
  },

  watch: {
    numberPages: function (value) {
      this.currentPage = this.currentPage > value ? value : this.currentPage
    },
    selectedCompanies: function (companies) {
      if (companies.length === 0) this.showDeleteSelectedBtn = false
      else this.showDeleteSelectedBtn = true
    }
  },

  beforeMount () {
    this.setLocalStorage()
    this.getCompaniesFromStrg()
    this.updateNumberPages()
    let id = this.$route.params.id
    if (id >= 1 && id <= this.numberPages) {
      this.currentPage = id
    } else {
      this.$router.push({ name: '404' })
    }
  },

  computed: {
    ...mapGetters(['companies', 'getNumberPages'])
  },

  methods: {
    updateNumberPages () {
      this.numberPages = this.getNumberPages(this.numberItems)
    },
    nextPage () {
      this.currentPage++
      this.pushRoute(this.currentPage)
    },
    prevPage () {
      this.currentPage--
      this.pushRoute(this.currentPage)
    },
    pushRoute (id) {
      this.$router.push({ params: { id: id } })
      this.resetSelectedCompanies()
    },
    goToPage (page) {
      this.currentPage = page.num
      this.pushRoute(this.currentPage)
    },
    showDeleteCompanyDialog (company) {
      this.companyToDelete = company
      this.isShowDeleteCompanyDialog = true
    },
    deleteCompany (company) {
      this.isShowDeleteCompanyDialog = false
      this.$store.dispatch({
        type: 'deleteCompany',
        id: company.inn
      })
      this.companyToDelete = {}
      this.updateNumberPages()
    },
    closeDeleteCompanyDialog () {
      this.isShowDeleteCompanyDialog = false
      this.companyToDelete = {}
    },
    showDeleteCompaniesDialog () {
      this.isShowDeleteCompaniesDialog = true
    },
    deleteCompanies (company) {
      this.isShowDeleteCompaniesDialog = false
      this.selectedCompanies.forEach((company, i, companies) => {
        this.deleteCompany(company)
      })
      this.selectedCompanies = []
    },
    closeDeleteCompaniesDialog () {
      this.isShowDeleteCompaniesDialog = false
      this.companyToDelete = {}
    },
    addSelectedCompany (company, isSelected) {
      if (isSelected) {
        this.selectedCompanies.push(company)
      } else {
        this.selectedCompanies.forEach((arrCompany, i, companies) => {
          if (arrCompany.inn === company.inn) {
            companies.splice(i, 1)
          }
        })
      }
    },
    resetSelectedCompanies () {
      this.selectedCompanies = []
    },
    showCreateCompanyDialog (company) {
      this.companyToEdit = company
      this.isShowCreateCompanyDialog = true
    },
    createCompany (company) {
      this.$store.dispatch({
        type: 'addCompany',
        company: company
      })
      this.isShowCreateCompanyDialog = false
      this.companyToEdit = {}
      this.updateNumberPages()
    },
    editCompany (company, id) {
      this.$store.dispatch({
        type: 'editCompany',
        company: company,
        id: id
      })
      this.isShowCreateCompanyDialog = false
      this.companyToEdit = {}
    },
    closeCreateCompanyDialog () {
      this.isShowCreateCompanyDialog = false
      this.companyToEdit = {}
    },
    getCompaniesFromStrg () {
      this.$store.dispatch({
        type: 'getCompaniesFromStrg'
      })
    },
    sortedCompanies () {
      if (this.sortParams.sort == '') return this.companies
      let companies = this.companies
      let sort = this.sortParams.sort
      let direction = this.sortParams.direction
      let parseSort = sort.split('.')
      let leftSortValue, rightSortValue
      companies.forEach((item, i) => {
        for (let j = 0; j < companies.length - i - 1; j++) {
          leftSortValue = companies[j]
          rightSortValue = companies[j + 1]
          parseSort.forEach(sort => {
            leftSortValue = leftSortValue[sort]
            rightSortValue = rightSortValue[sort]
          })
          if (this.compare(leftSortValue, rightSortValue) * direction > 0) {
            // смотрите как умею, но ВУЙ к такому не реактивен(( плачу
            // [companies[j], companies[j + 1]] = [companies[j + 1], companies[j]];

            // придется делать по старинке
            let temp = companies[j]
            companies.splice(j, 1, companies[j + 1])
            companies.splice(j + 1, 1, temp)
            // пыль сошла даже
          }
        }
      })
      return companies
    },
    sortCompanies (sort, direction) {
      this.sortParams = {
        sort: sort,
        direction: direction
      }
      // можно в компутед, но так реже будет обновляться, чище
      this.sortedCompanies()
    },
    compare (left, right) {
      if (isNaN(+left)) {
        left = left.toUpperCase()
        right = right.toUpperCase()
        return left > right ? 1 : -1
      } else {
        left = +left
        right = +right
        return left - right
      }
    },
    setLocalStorage () {
      // Друзья, ну не руками ж вы будете их туда впиливать
      // да можно это в другом месте сделать
      // это вообще к тестовому не относится ))
      // так что будет так
      // ниже этой функции ничего интересного нет, можно не листать)
      // На самом деле у меня функция была, которя это все заполнила,
      // но чет я ее удалил
      // Простите пожалуйста
      let companies = [
        {
          inn: '441172374463',
          name: 'Компания номер 0',
          director: {
            id: '13',
            fio: 'Авщрноо Ю.Ф.'
          }
        },
        {
          inn: '622359099140',
          name: 'Компания номер 1',
          director: {
            id: '15',
            fio: 'Юххемрхдд Х.Х.'
          }
        },
        {
          inn: '332539619892',
          name: 'Компания номер 302',
          director: {
            id: '617',
            fio: 'Ечшяацкч Х.И.'
          }
        },
        {
          inn: '295613441012',
          name: 'Компания номер 303',
          director: {
            id: '619',
            fio: 'Нжоеаны Д.Е.'
          }
        },
        {
          inn: '106940022720',
          name: 'Компания номер 304',
          director: {
            id: '621',
            fio: 'Флурдмпыи Т.Я.'
          }
        },

        {
          inn: '996177431007',
          name: 'Компания номер 2',
          director: {
            id: '17',
            fio: 'Рднвлхшеа М.Д.'
          }
        },
        {
          inn: '110003644258',
          name: 'Компания номер 3',
          director: {
            id: '19',
            fio: 'Оцяыняяж Г.Ц.'
          }
        },
        {
          inn: '329703430794',
          name: 'Компания номер 4',
          director: {
            id: '21',
            fio: 'Фалойшйщнй П.Д.'
          }
        },
        {
          inn: '368646382079',
          name: 'Компания номер 5',
          director: {
            id: '23',
            fio: 'Рчкпщдужмйии Л.Н.'
          }
        },
        {
          inn: '292363870166',
          name: 'Компания номер 53',
          director: {
            id: '119',
            fio: 'Хнесжвчмяу Ч.Я.'
          }
        },
        {
          inn: '961783424781',
          name: 'Компания номер 54',
          director: {
            id: '121',
            fio: 'Фщечмхцо П.Л.'
          }
        },
        {
          inn: '312231081654',
          name: 'Компания номер 55',
          director: {
            id: '123',
            fio: 'Дзаузпсш Ж.Ю.'
          }
        },
        {
          inn: '738566017337',
          name: 'Компания номер 56',
          director: {
            id: '125',
            fio: 'Рсиоллцмге Л.Ю.'
          }
        },
        {
          inn: '341055223927',
          name: 'Компания номер 57',
          director: {
            id: '127',
            fio: 'Арафщхжс Х.У.'
          }
        },
        {
          inn: '852839406553',
          name: 'Компания номер 58',
          director: {
            id: '129',
            fio: 'Беылшичпгя Х.Х.'
          }
        },
        {
          inn: '211249386275',
          name: 'Компания номер 59',
          director: {
            id: '131',
            fio: 'Ожегуамя Е.М.'
          }
        },
        {
          inn: '904912375427',
          name: 'Компания номер 60',
          director: {
            id: '133',
            fio: 'Вмцомлчд Х.Х.'
          }
        },
        {
          inn: '145553178619',
          name: 'Компания номер 61',
          director: {
            id: '135',
            fio: 'Гыпвщшшщхр Ж.М.'
          }
        },
        {
          inn: '933325950575',
          name: 'Компания номер 62',
          director: {
            id: '137',
            fio: 'Уиижшгщях Ж.С.'
          }
        },
        {
          inn: '671805993537',
          name: 'Компания номер 63',
          director: {
            id: '139',
            fio: 'Нозгцхзы Р.Ю.'
          }
        },
        {
          inn: '555370605209',
          name: 'Компания номер 64',
          director: {
            id: '141',
            fio: 'Дйрвриирыд З.П.'
          }
        },
        {
          inn: '912604573342',
          name: 'Компания номер 65',
          director: {
            id: '143',
            fio: 'Ещкдвмсы Х.Х.'
          }
        },
        {
          inn: '381780106404',
          name: 'Компания номер 66',
          director: {
            id: '145',
            fio: 'Чзмфкйду Р.Ю.'
          }
        },
        {
          inn: '223072939704',
          name: 'Компания номер 67',
          director: {
            id: '147',
            fio: 'Тцлягйфафпцк У.Ф.'
          }
        },
        {
          inn: '710992184005',
          name: 'Компания номер 68',
          director: {
            id: '149',
            fio: 'Фвнжорр О.В.'
          }
        },
        {
          inn: '641110164333',
          name: 'Компания номер 69',
          director: {
            id: '151',
            fio: 'Тмуосизс Н.Ц.'
          }
        },
        {
          inn: '417807845962',
          name: 'Компания номер 70',
          director: {
            id: '153',
            fio: 'Тунщшжо У.К.'
          }
        },
        {
          inn: '286160892051',
          name: 'Компания номер 71',
          director: {
            id: '155',
            fio: 'Бфыыскфщйз Ц.П.'
          }
        },
        {
          inn: '867098127115',
          name: 'Компания номер 72',
          director: {
            id: '157',
            fio: 'Сйыахпйжцл В.Б.'
          }
        },
        {
          inn: '782600903432',
          name: 'Компания номер 73',
          director: {
            id: '159',
            fio: 'Юуяваац Н.П.'
          }
        },
        {
          inn: '413938249453',
          name: 'Компания номер 74',
          director: {
            id: '161',
            fio: 'Кчуаяыавфц И.Х.'
          }
        },
        {
          inn: '674044267452',
          name: 'Компания номер 75',
          director: {
            id: '163',
            fio: 'Ишнппимли Ц.Ц.'
          }
        },
        {
          inn: '416450980115',
          name: 'Компания номер 76',
          director: {
            id: '165',
            fio: 'Хуфмайдрд Ш.В.'
          }
        },
        {
          inn: '730329259264',
          name: 'Компания номер 77',
          director: {
            id: '167',
            fio: 'Лфзежащрж Х.Р.'
          }
        },
        {
          inn: '847988646847',
          name: 'Компания номер 78',
          director: {
            id: '169',
            fio: 'Цаксмшед Я.А.'
          }
        },
        {
          inn: '591721394123',
          name: 'Компания номер 79',
          director: {
            id: '171',
            fio: 'Вчеанпйдси З.Д.'
          }
        },
        {
          inn: '143368467184',
          name: 'Компания номер 80',
          director: {
            id: '173',
            fio: 'Муцнкцфея Ж.Т.'
          }
        },
        {
          inn: '187457220019',
          name: 'Компания номер 81',
          director: {
            id: '175',
            fio: 'Ршкнмцм А.Д.'
          }
        },
        {
          inn: '569205104379',
          name: 'Компания номер 82',
          director: {
            id: '177',
            fio: 'Лйпцлкужг Е.В.'
          }
        },
        {
          inn: '999644570374',
          name: 'Компания номер 83',
          director: {
            id: '179',
            fio: 'Смыжцаа Ю.И.'
          }
        },
        {
          inn: '183262296908',
          name: 'Компания номер 84',
          director: {
            id: '181',
            fio: 'Хрячыгрижцду Ф.К.'
          }
        },
        {
          inn: '885501177751',
          name: 'Компания номер 85',
          director: {
            id: '183',
            fio: 'Ехрхяжви П.Ю.'
          }
        },
        {
          inn: '923415665011',
          name: 'Компания номер 86',
          director: {
            id: '185',
            fio: 'Ещйкыыну Ч.Т.'
          }
        },
        {
          inn: '222798152738',
          name: 'Компания номер 87',
          director: {
            id: '187',
            fio: 'Снчхщвмп С.Д.'
          }
        },
        {
          inn: '738567088336',
          name: 'Компания номер 88',
          director: {
            id: '189',
            fio: 'Мщаменыкдч У.А.'
          }
        },
        {
          inn: '785596348967',
          name: 'Компания номер 89',
          director: {
            id: '191',
            fio: 'Врипцлфсжоы О.А.'
          }
        },
        {
          inn: '419695870603',
          name: 'Компания номер 90',
          director: {
            id: '193',
            fio: 'Яызйчцоне Ф.Н.'
          }
        },
        {
          inn: '949664276634',
          name: 'Компания номер 91',
          director: {
            id: '195',
            fio: 'Хешмплк Ц.Т.'
          }
        },
        {
          inn: '784800107160',
          name: 'Компания номер 92',
          director: {
            id: '197',
            fio: 'Кнчроысжяф Т.Х.'
          }
        },
        {
          inn: '327188046632',
          name: 'Компания номер 93',
          director: {
            id: '199',
            fio: 'Кззчпвчрйз Б.Я.'
          }
        },
        {
          inn: '202739998790',
          name: 'Компания номер 94',
          director: {
            id: '201',
            fio: 'Азпгкйха П.Ш.'
          }
        },
        {
          inn: '273443829689',
          name: 'Компания номер 95',
          director: {
            id: '203',
            fio: 'Фдцучрнп О.Ж.'
          }
        },
        {
          inn: '399412848900',
          name: 'Компания номер 96',
          director: {
            id: '205',
            fio: 'Лщдоовзмш В.Ч.'
          }
        },
        {
          inn: '681606946606',
          name: 'Компания номер 97',
          director: {
            id: '207',
            fio: 'Фзкснлахя О.С.'
          }
        },
        {
          inn: '249561891274',
          name: 'Компания номер 98',
          director: {
            id: '209',
            fio: 'Цсрищчзиыы Х.Н.'
          }
        },
        {
          inn: '763027979680',
          name: 'Компания номер 99',
          director: {
            id: '211',
            fio: 'Лунасркфо Д.М.'
          }
        },
        {
          inn: '912496679464',
          name: 'Компания номер 100',
          director: {
            id: '213',
            fio: 'Аоячяшзечкф Т.Ч.'
          }
        },
        {
          inn: '254067265993',
          name: 'Компания номер 101',
          director: {
            id: '215',
            fio: 'Лжарсшсыв Н.Х.'
          }
        },
        {
          inn: '609997298232',
          name: 'Компания номер 102',
          director: {
            id: '217',
            fio: 'Санчаыинсй Ч.П.'
          }
        },
        {
          inn: '135865330761',
          name: 'Компания номер 103',
          director: {
            id: '219',
            fio: 'Нснгырнаш Д.З.'
          }
        },
        {
          inn: '991103873667',
          name: 'Компания номер 104',
          director: {
            id: '221',
            fio: 'Злрыщнпн А.О.'
          }
        },
        {
          inn: '934817047345',
          name: 'Компания номер 105',
          director: {
            id: '223',
            fio: 'Кпфпызф В.Г.'
          }
        },
        {
          inn: '177628560228',
          name: 'Компания номер 106',
          director: {
            id: '225',
            fio: 'Цжсвечзхцфра Б.Т.'
          }
        },
        {
          inn: '711006049528',
          name: 'Компания номер 107',
          director: {
            id: '227',
            fio: 'Иппначхшх Ч.Н.'
          }
        },
        {
          inn: '373088783059',
          name: 'Компания номер 108',
          director: {
            id: '229',
            fio: 'Оеняжофщжех Б.Х.'
          }
        },
        {
          inn: '209793402554',
          name: 'Компания номер 109',
          director: {
            id: '231',
            fio: 'Грххфцяу М.Е.'
          }
        },
        {
          inn: '769321332057',
          name: 'Компания номер 110',
          director: {
            id: '233',
            fio: 'Хкукзячфв Я.О.'
          }
        },
        {
          inn: '306221307163',
          name: 'Компания номер 111',
          director: {
            id: '235',
            fio: 'Хцурингвз Л.Я.'
          }
        },
        {
          inn: '674516737811',
          name: 'Компания номер 112',
          director: {
            id: '237',
            fio: 'Гмфяяивяааы М.Ф.'
          }
        },
        {
          inn: '716237492906',
          name: 'Компания номер 113',
          director: {
            id: '239',
            fio: 'Цацрржз М.У.'
          }
        },
        {
          inn: '302969454486',
          name: 'Компания номер 114',
          director: {
            id: '241',
            fio: 'Жзйыпяо Ю.Р.'
          }
        },
        {
          inn: '797749506956',
          name: 'Компания номер 115',
          director: {
            id: '243',
            fio: 'Цчмзсяо Ф.Б.'
          }
        },
        {
          inn: '189587259829',
          name: 'Компания номер 116',
          director: {
            id: '245',
            fio: 'Ввцнрпсссч П.Т.'
          }
        },
        {
          inn: '201883345529',
          name: 'Компания номер 117',
          director: {
            id: '247',
            fio: 'Пнхйесы Ч.П.'
          }
        },
        {
          inn: '188387521547',
          name: 'Компания номер 118',
          director: {
            id: '249',
            fio: 'Зпждцгн Х.Б.'
          }
        },
        {
          inn: '482208255226',
          name: 'Компания номер 119',
          director: {
            id: '251',
            fio: 'Нржляиезсл У.Ф.'
          }
        },
        {
          inn: '902502514367',
          name: 'Компания номер 120',
          director: {
            id: '253',
            fio: 'Гжорсхвй Р.Ю.'
          }
        },
        {
          inn: '110916543468',
          name: 'Компания номер 121',
          director: {
            id: '255',
            fio: 'Юдядхшкспй З.И.'
          }
        },
        {
          inn: '756970603384',
          name: 'Компания номер 122',
          director: {
            id: '257',
            fio: 'Апвпщиг О.Ф.'
          }
        },
        {
          inn: '567173880477',
          name: 'Компания номер 123',
          director: {
            id: '259',
            fio: 'Цсфвщгскг О.Ч.'
          }
        },
        {
          inn: '792579739986',
          name: 'Компания номер 124',
          director: {
            id: '261',
            fio: 'Сплщедгяод А.Е.'
          }
        },
        {
          inn: '344027820496',
          name: 'Компания номер 125',
          director: {
            id: '263',
            fio: 'Нощсмяхшигфш Н.М.'
          }
        },
        {
          inn: '733631439511',
          name: 'Компания номер 126',
          director: {
            id: '265',
            fio: 'Снгзйед Ч.Р.'
          }
        },
        {
          inn: '188560846195',
          name: 'Компания номер 127',
          director: {
            id: '267',
            fio: 'Жцнлнпй Т.Ю.'
          }
        },
        {
          inn: '673153696107',
          name: 'Компания номер 128',
          director: {
            id: '269',
            fio: 'Язичпжвшлл Б.Ч.'
          }
        },
        {
          inn: '511196509103',
          name: 'Компания номер 129',
          director: {
            id: '271',
            fio: 'Шыщчфвхчг Г.Т.'
          }
        },
        {
          inn: '141008956918',
          name: 'Компания номер 130',
          director: {
            id: '273',
            fio: 'Усваащкыощш З.Р.'
          }
        },
        {
          inn: '661543822329',
          name: 'Компания номер 131',
          director: {
            id: '275',
            fio: 'Мйщшгнрхл П.Ф.'
          }
        },
        {
          inn: '809516150168',
          name: 'Компания номер 132',
          director: {
            id: '277',
            fio: 'Ойфлехпии Ц.Б.'
          }
        },
        {
          inn: '476473746176',
          name: 'Компания номер 133',
          director: {
            id: '279',
            fio: 'Гшеяаыззхся Я.Ч.'
          }
        },
        {
          inn: '872113713016',
          name: 'Компания номер 134',
          director: {
            id: '281',
            fio: 'Бмхмйзчцн Е.К.'
          }
        },
        {
          inn: '592300840377',
          name: 'Компания номер 135',
          director: {
            id: '283',
            fio: 'Шяфчнщзнм Г.Т.'
          }
        },
        {
          inn: '833560677715',
          name: 'Компания номер 136',
          director: {
            id: '285',
            fio: 'Гшпнкчжлп Г.Б.'
          }
        },
        {
          inn: '329065027983',
          name: 'Компания номер 137',
          director: {
            id: '287',
            fio: 'Жыопщуецф В.Е.'
          }
        },
        {
          inn: '690847218784',
          name: 'Компания номер 138',
          director: {
            id: '289',
            fio: 'Тккшрыжхс В.М.'
          }
        },
        {
          inn: '485696193067',
          name: 'Компания номер 139',
          director: {
            id: '291',
            fio: 'Пчнщпзи О.В.'
          }
        },
        {
          inn: '599729992155',
          name: 'Компания номер 140',
          director: {
            id: '293',
            fio: 'Нпщщемнац З.Ю.'
          }
        },
        {
          inn: '543685950820',
          name: 'Компания номер 141',
          director: {
            id: '295',
            fio: 'Кпщлшлйоп П.Н.'
          }
        },
        {
          inn: '416277670093',
          name: 'Компания номер 142',
          director: {
            id: '297',
            fio: 'Цоляыеоф Ю.Ц.'
          }
        },
        {
          inn: '695209781559',
          name: 'Компания номер 143',
          director: {
            id: '299',
            fio: 'Еыисхмцинл К.У.'
          }
        },
        {
          inn: '584167416076',
          name: 'Компания номер 144',
          director: {
            id: '301',
            fio: 'Нжымфдысщшчп П.П.'
          }
        },
        {
          inn: '654537759980',
          name: 'Компания номер 259',
          director: {
            id: '531',
            fio: 'Азккоййуч Г.Р.'
          }
        },
        {
          inn: '734724457176',
          name: 'Компания номер 260',
          director: {
            id: '533',
            fio: 'Вмелисйкуа М.С.'
          }
        },
        {
          inn: '797827298887',
          name: 'Компания номер 261',
          director: {
            id: '535',
            fio: 'Чщвзгчешар Б.Р.'
          }
        },
        {
          inn: '917340654778',
          name: 'Компания номер 262',
          director: {
            id: '537',
            fio: 'Ечйкщиу В.Ф.'
          }
        },
        {
          inn: '927756988474',
          name: 'Компания номер 263',
          director: {
            id: '539',
            fio: 'Хгжажгя П.Г.'
          }
        },
        {
          inn: '906855906565',
          name: 'Компания номер 264',
          director: {
            id: '541',
            fio: 'Юхшхрынй Л.Ф.'
          }
        },
        {
          inn: '143347871257',
          name: 'Компания номер 265',
          director: {
            id: '543',
            fio: 'Ящйфвмещй Ф.Б.'
          }
        },
        {
          inn: '200086597949',
          name: 'Компания номер 266',
          director: {
            id: '545',
            fio: 'Тыпгмаяпож Я.К.'
          }
        },
        {
          inn: '258382768140',
          name: 'Компания номер 267',
          director: {
            id: '547',
            fio: 'Гвххцдч Е.М.'
          }
        },
        {
          inn: '266772913609',
          name: 'Компания номер 268',
          director: {
            id: '549',
            fio: 'Вроуняжжц У.Р.'
          }
        },
        {
          inn: '964698981646',
          name: 'Компания номер 269',
          director: {
            id: '551',
            fio: 'Гфзхавкшс В.Ц.'
          }
        },
        {
          inn: '338685396759',
          name: 'Компания номер 270',
          director: {
            id: '553',
            fio: 'Чмиыуждж Ю.Е.'
          }
        },
        {
          inn: '494282258278',
          name: 'Компания номер 271',
          director: {
            id: '555',
            fio: 'Бзрсщличомз Я.Е.'
          }
        },
        {
          inn: '727564488909',
          name: 'Компания номер 272',
          director: {
            id: '557',
            fio: 'Швящпкчгпцнч А.К.'
          }
        },
        {
          inn: '380897964496',
          name: 'Компания номер 273',
          director: {
            id: '559',
            fio: 'Гшядхжжич Ю.Ю.'
          }
        },
        {
          inn: '228384107428',
          name: 'Компания номер 274',
          director: {
            id: '561',
            fio: 'Аззпудынл Д.Ф.'
          }
        },
        {
          inn: '176015455303',
          name: 'Компания номер 275',
          director: {
            id: '563',
            fio: 'Мзыслпдмд У.Я.'
          }
        },
        {
          inn: '422764679732',
          name: 'Компания номер 276',
          director: {
            id: '565',
            fio: 'Оумсжсшфлге Е.Д.'
          }
        },
        {
          inn: '997449895795',
          name: 'Компания номер 277',
          director: {
            id: '567',
            fio: 'Фынхигчнцвж Ш.Р.'
          }
        },
        {
          inn: '125413306677',
          name: 'Компания номер 278',
          director: {
            id: '569',
            fio: 'Гщаждмркчдч Ф.Я.'
          }
        },
        {
          inn: '608530007076',
          name: 'Компания номер 279',
          director: {
            id: '571',
            fio: 'Зщуелвыккц У.В.'
          }
        },
        {
          inn: '229998832858',
          name: 'Компания номер 280',
          director: {
            id: '573',
            fio: 'Уцамянсшв В.П.'
          }
        },
        {
          inn: '108581855115',
          name: 'Компания номер 281',
          director: {
            id: '575',
            fio: 'Яныввцн М.Р.'
          }
        },
        {
          inn: '462134571972',
          name: 'Компания номер 282',
          director: {
            id: '577',
            fio: 'Рплргцяфри В.Я.'
          }
        },
        {
          inn: '362190131189',
          name: 'Компания номер 283',
          director: {
            id: '579',
            fio: 'Хщярдкыо Ц.Я.'
          }
        },
        {
          inn: '494181152871',
          name: 'Компания номер 284',
          director: {
            id: '581',
            fio: 'Оирмфняхч Ш.Р.'
          }
        },
        {
          inn: '410099540824',
          name: 'Компания номер 285',
          director: {
            id: '583',
            fio: 'Гшвуыышзфд Е.Ш.'
          }
        },
        {
          inn: '202354658231',
          name: 'Компания номер 286',
          director: {
            id: '585',
            fio: 'Врлджснвыг К.З.'
          }
        },
        {
          inn: '463366208120',
          name: 'Компания номер 287',
          director: {
            id: '587',
            fio: 'Уфгыфхсшху Н.К.'
          }
        },
        {
          inn: '120749269128',
          name: 'Компания номер 288',
          director: {
            id: '589',
            fio: 'Чвщлсчзф Ж.И.'
          }
        },
        {
          inn: '174131076495',
          name: 'Компания номер 289',
          director: {
            id: '591',
            fio: 'Зиуцпфи В.Ч.'
          }
        },
        {
          inn: '872999341957',
          name: 'Компания номер 290',
          director: {
            id: '593',
            fio: 'Брйкырмж Х.К.'
          }
        },
        {
          inn: '169096340923',
          name: 'Компания номер 291',
          director: {
            id: '595',
            fio: 'Унеаклофл Е.Б.'
          }
        },
        {
          inn: '565407905049',
          name: 'Компания номер 292',
          director: {
            id: '597',
            fio: 'Ифиыкгол Е.Я.'
          }
        },
        {
          inn: '726340182255',
          name: 'Компания номер 293',
          director: {
            id: '599',
            fio: 'Ющыпзрыжйы Я.С.'
          }
        },
        {
          inn: '740902211080',
          name: 'Компания номер 294',
          director: {
            id: '601',
            fio: 'Ейккечийжйш И.В.'
          }
        },
        {
          inn: '991901388609',
          name: 'Компания номер 295',
          director: {
            id: '603',
            fio: 'Кдфщноеднщн Я.В.'
          }
        },
        {
          inn: '305761744960',
          name: 'Компания номер 296',
          director: {
            id: '605',
            fio: 'Вмкалвдш Ц.Я.'
          }
        },
        {
          inn: '467363318858',
          name: 'Компания номер 297',
          director: {
            id: '607',
            fio: 'Тхоцгиоднщ Р.Ч.'
          }
        },
        {
          inn: '356862793466',
          name: 'Компания номер 298',
          director: {
            id: '609',
            fio: 'Тощынщевя Г.Ч.'
          }
        },
        {
          inn: '817769519661',
          name: 'Компания номер 299',
          director: {
            id: '611',
            fio: 'Цуупжцзрг С.Д.'
          }
        },
        {
          inn: '150428260325',
          name: 'Компания номер 300',
          director: {
            id: '613',
            fio: 'Рпффхдхсоа Х.С.'
          }
        },
        {
          inn: '714123964184',
          name: 'Компания номер 301',
          director: {
            id: '615',
            fio: 'Бокнечм Е.Ж.'
          }
        },
        {
          inn: '794426137122',
          name: 'Компания номер 305',
          director: {
            id: '623',
            fio: 'Алфыепдйчу Я.Ч.'
          }
        },
        {
          inn: '537434136764',
          name: 'Компания номер 306',
          director: {
            id: '625',
            fio: 'Каичопйкф Я.С.'
          }
        },
        {
          inn: '414009726758',
          name: 'Компания номер 475',
          director: {
            id: '963',
            fio: 'Хфусйух Ф.Р.'
          }
        },
        {
          inn: '228212330886',
          name: 'Компания номер 476',
          director: {
            id: '965',
            fio: 'Нчнисфук Ш.И.'
          }
        },
        {
          inn: '944763202887',
          name: 'Компания номер 477',
          director: {
            id: '967',
            fio: 'Сыадшлсы С.Р.'
          }
        },
        {
          inn: '645832730937',
          name: 'Компания номер 478',
          director: {
            id: '969',
            fio: 'Жщшышузгй Ч.В.'
          }
        },
        {
          inn: '726381824998',
          name: 'Компания номер 479',
          director: {
            id: '971',
            fio: 'Врывпнык С.Г.'
          }
        },
        {
          inn: '539827255394',
          name: 'Компания номер 480',
          director: {
            id: '973',
            fio: 'Бжсхгцягд Ю.Л.'
          }
        },
        {
          inn: '132091767218',
          name: 'Компания номер 481',
          director: {
            id: '975',
            fio: 'Трыггйгд М.С.'
          }
        },
        {
          inn: '151456148319',
          name: 'Компания номер 482',
          director: {
            id: '977',
            fio: 'Зпдмндсу Н.Г.'
          }
        },
        {
          inn: '339923593618',
          name: 'Компания номер 483',
          director: {
            id: '979',
            fio: 'Яхзмгнщцжка Б.У.'
          }
        },
        {
          inn: '980842139199',
          name: 'Компания номер 484',
          director: {
            id: '981',
            fio: 'Сйапасзяо Б.Г.'
          }
        },
        {
          inn: '730021679089',
          name: 'Компания номер 485',
          director: {
            id: '983',
            fio: 'Цпсаинщщн Н.А.'
          }
        },
        {
          inn: '892121970980',
          name: 'Компания номер 486',
          director: {
            id: '985',
            fio: 'Ягчффешя Ч.Р.'
          }
        },
        {
          inn: '341982656378',
          name: 'Компания номер 487',
          director: {
            id: '987',
            fio: 'Здишшопш Ю.Б.'
          }
        },
        {
          inn: '132325301385',
          name: 'Компания номер 488',
          director: {
            id: '989',
            fio: 'Цащегжлыфя С.А.'
          }
        },
        {
          inn: '261080074016',
          name: 'Компания номер 489',
          director: {
            id: '991',
            fio: 'Дсчпшзяхачйм Х.В.'
          }
        },
        {
          inn: '828560369921',
          name: 'Компания номер 490',
          director: {
            id: '993',
            fio: 'Зидяшорфящх П.Д.'
          }
        },
        {
          inn: '253561318849',
          name: 'Компания номер 491',
          director: {
            id: '995',
            fio: 'Аплеввгж Я.Я.'
          }
        },
        {
          inn: '106823183884',
          name: 'Компания номер 492',
          director: {
            id: '997',
            fio: 'Сямвсккхф Л.Ж.'
          }
        },
        {
          inn: '598230481388',
          name: 'Компания номер 493',
          director: {
            id: '999',
            fio: 'Нзйдпшса Ч.Л.'
          }
        },
        {
          inn: '116877608881',
          name: 'Компания номер 494',
          director: {
            id: '1001',
            fio: 'Мвшшумйр В.Я.'
          }
        },
        {
          inn: '594359732997',
          name: 'Компания номер 495',
          director: {
            id: '1003',
            fio: 'Ямзсгугв Е.С.'
          }
        },
        {
          inn: '336204629705',
          name: 'Компания номер 496',
          director: {
            id: '1005',
            fio: 'Емшдфцгнн М.Х.'
          }
        },
        {
          inn: '113164839156',
          name: 'Компания номер 497',
          director: {
            id: '1007',
            fio: 'Фхсвнизккц М.Ж.'
          }
        },
        {
          inn: '548629384786',
          name: 'Компания номер 498',
          director: {
            id: '1009',
            fio: 'Смжжжез Н.С.'
          }
        },
        {
          inn: '783065346686',
          name: 'Компания номер 499',
          director: {
            id: '1011',
            fio: 'Шрдаигздыа О.В.'
          }
        }
      ]
      let firstEntry = localStorage.getItem('firstEntry')
      if (firstEntry !== 'no') {
        localStorage.setItem('companies', JSON.stringify(companies))
      }
      localStorage.setItem('firstEntry', 'no')
    }
  },

  components: {
    'company-list': CompanyList,
    navigation: Navigation,
    'delete-company-dialog': DeleteCompanyDialog,
    'delete-companies-dialog': DeleteCompaniesDialog,
    'create-company-dialog': CreateCompanyDialog,
    filters: Filters
  }
}
</script>

<style scoped>
.delete-btns {
  position: fixed;
  top: 48px;
  width: 312px;
}
.cancel-btn {
  min-width: 0;
}
.create-btn {
  position: fixed;
  bottom: 0;
  right: 10%;
}
.company-list-margin {
  margin-bottom: 60px;
}
</style>
