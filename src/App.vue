<template>
  <v-app>
    <v-app-bar
        app
        color="#08121e"
        dark
    >
      <div class="d-flex align-center">
        <v-img
            alt="Telcotrend logo"
            contain
            min-width="100"
            :src="logoPath"
            width="100"
        />
      </div>

      <v-spacer></v-spacer>

      <div class="d-flex align-center">
        <v-btn text @click="stepDays(-7)">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <p style="display: contents;">{{ parseDate(getNthWeekDay(0), false) }} - {{
            parseDate(getNthWeekDay(4), false)
          }}</p>
        <v-btn text @click="stepDays(7)">
          <v-icon>mdi-arrow-right</v-icon>
        </v-btn>
      </div>

      <v-spacer></v-spacer>

      <div></div>
    </v-app-bar>

    <v-main>
      <Calendar :start="start" :reserves="reserves" @updateReserves="updateReserves"/>
    </v-main>
  </v-app>
</template>

<script>
import {getFromEndpoint} from "@/request/axios";
import Calendar from "@/components/Calendar";

export default {
  name: 'App',

  components: {
    Calendar
  },


  data() {
    return {
      start: this.getNthWeekDay(0),
      reserves: [],
      logoPath: require('./assets/telcoLogo.png')
    }
  },

  methods: {
    async getReserves() {
      this.reserves = await getFromEndpoint('reserves');
    },

    stepDays(numberOfDays) {
      const first = this.start.getDate() - this.start.getDay() + 1;
      this.start = new Date(this.start.setDate(first + numberOfDays));
    },

    //Index from 0
    getNthWeekDay(nthDay) {
      const today = this.start ? this.start : new Date();
      const first = today.getDate() - today.getDay() + 1;

      return new Date(today.setDate(first + nthDay));
    },

    parseDate(date, includeTime = true) {
      let month = this.addPreZero(date.getMonth() + 1);
      let day = this.addPreZero(date.getDate());
      let hour = this.addPreZero(date.getHours());
      let minute = this.addPreZero(date.getMinutes());
      let separator = '.';
      let result = month + separator + day;
      if (includeTime) {
        result += ' ' + hour + ':' + minute;
      }
      return result;
    },

    addPreZero(num) {
      return num < 10 ? '0' + num : num;
    },

    updateReserves(reservesParam) {
      this.reserves = reservesParam;
    }
  },

  mounted() {
    this.getReserves();
  }
};


</script>

<style>
html {
  background-color: #1E1E1E;
}

::-webkit-scrollbar {
  width: 0.5em;
}

/* Track */
::-webkit-scrollbar-track {
  background: #1E1E1E;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #f1f1f150;
  border-radius: 50px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #528BBF;
}
</style>