<template>
  <v-row>
    <v-col>
      <v-sheet height="55em">
        <v-calendar
            ref="calendar"
            :now="today"
            :value="parseDate(start)"
            :events="this.parseReserves()"
            color="#528BBF"
            type="week"
            locale="hu-HU"
            :weekdays="[1, 2, 3, 4, 5]"
            @click:event="this.showEvent"
            @click:time="this.createElement"
            event-color="#528BBF"
            :first-interval=6
            :interval-count=15
        >
          <template v-slot:event="{ event }">
            <div
                class="v-event-draggable"
                v-html="eventSummary(event)"
            ></div>
          </template>
        </v-calendar>

        <v-dialog
            v-model="dialogOpen"
            max-width="300"
        >
          <v-form v-model="valid" ref="form">
            <v-card>
              <v-card-title class="text-h5">
                {{ actualEvent.id ? actualEvent.name : "Foglalás létrehozása" }}
              </v-card-title>

              <v-card-text>
                <v-text-field
                    label="Megbeszélés neve"
                    v-model="actualEvent.name"
                    :value="actualEvent.name"
                    :rules="emptyRules"
                    @blur="validate"
                ></v-text-field>

                <v-text-field
                    label="Mettől"
                    v-model="actualEvent.startTime"
                    :value="actualEvent.startTime"
                    type="time"
                    :rules="emptyRules"
                    @blur="validate"
                    dark
                ></v-text-field>

                <v-text-field
                    label="Meddig"
                    v-model="actualEvent.endTime"
                    :value="actualEvent.endTime"
                    type="time"
                    :rules="emptyRules"
                    @blur="validate"
                ></v-text-field>

                <v-text-field
                    label="Résztvevők száma"
                    v-model="actualEvent.attendees_count"
                    :value="actualEvent.attendees_count"
                    type="number"
                ></v-text-field>

                <v-textarea
                    label="Résztvevők"
                    v-model="actualEvent.attendees"
                    :value="actualEvent.attendees"
                    rows="3"
                    hint="Résztvevők felsorolása"
                ></v-textarea>

                <v-checkbox
                    v-model="weekly"
                    label="Heti ismétlődés"
                    :value="weekly"
                    hide-details
                    dark
                ></v-checkbox>

                <v-menu
                    v-model="datePicker"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                    v-if="weekly"
                    dark
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                        v-model="repeatUntil"
                        label="Ismétlődés eddig"
                        prepend-icon="mdi-calendar"
                        readonly
                        v-bind="attrs"
                        v-on="on"
                        locale="hu-hu"
                        dark
                    ></v-text-field>
                  </template>
                  <v-date-picker
                      v-model="repeatUntil"
                      @input="datePicker = false"
                      locale="hu-hu"
                      dark
                      first-day-of-week=1
                  ></v-date-picker>
                </v-menu>
              </v-card-text>

              <v-card-actions>
                <v-btn
                    color="red darken-1"
                    text
                    @click="remove"
                    v-if="actualEvent.id"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
                <v-spacer></v-spacer>

                <v-btn
                    color="red darken-1"
                    text
                    @click="cancel"
                >
                  Mégse
                </v-btn>

                <v-btn
                    color="green darken-1"
                    text
                    @click="save"
                >
                  Mentés
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-form>
        </v-dialog>
      </v-sheet>
    </v-col>
  </v-row>
</template>

<script>

import {deleteToEndpoint, postToEndpoint, putToEndpoint} from "@/request/axios";

export default {
  name: "Calendar",
  props: ['start', 'reserves'],
  data() {
    return {
      today: this.parseDate(new Date()),
      dialogOpen: false,
      actualEvent: {},
      weekly: false,
      repeatUntil: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
      datePicker: false,
      valid: false,
      emptyRules: [
        v => !!v || 'Kötelező adat!',
      ]
    }
  },

  methods: {

    eventSummary(event) {
      const eventSummaryClass = 'v-event-summary'
      const start = new Date(event.start);
      const startTime = `${this.addPreZero(start.getHours())}:${this.addPreZero(start.getMinutes())}`;

      const end = new Date(event.end);
      const endTime = `${this.addPreZero(end.getHours())}:${this.addPreZero(end.getMinutes())}`;
      let attendesCountText = ' ';
      if (event.attendees_count) {
        attendesCountText = `(${event.attendees_count} fő)`;
      }

      return `<span class="${eventSummaryClass}">
         <strong>${startTime} - ${endTime}</strong>
            <br/>
        ${event.name} ${attendesCountText}
        </span>`
    },

    parseReserves() {
      for (let reserve of this.reserves) {
        reserve.start = this.parseDate(new Date(reserve.start));
        reserve.end = this.parseDate(new Date(reserve.finish));
      }
      return this.reserves;
    },

    parseDate(date, includeTime = true) {
      let year = date.getFullYear();
      let month = this.addPreZero(date.getMonth() + 1);
      let day = this.addPreZero(date.getDate());
      let hour = this.addPreZero(date.getHours());
      let minute = this.addPreZero(date.getMinutes());
      let separator = '-';
      let result = year + separator + month + separator + day;
      if (includeTime) {
        result += ' ' + hour + ':' + minute;
      }
      return result;
    },

    addPreZero(num) {
      return num < 10 ? '0' + num : num;
    },

    showEvent(event) {
      this.actualEvent = {
        id: event.event.id,
        name: event.event.name,
        start: new Date(event.event.start),
        finish: new Date(event.event.finish),
        attendees_count: event.event.attendees_count,
        attendees: event.event.attendees
      };

      this.actualEvent.startTime = this.addPreZero(this.actualEvent.start.getHours()) + ":" + this.addPreZero(this.actualEvent.start.getMinutes());
      this.actualEvent.endTime = this.addPreZero(this.actualEvent.finish.getHours()) + ":" + this.addPreZero(this.actualEvent.finish.getMinutes());
      this.flipOpen();
    },

    createElement(dayTime) {
      if (!this.actualEvent.id) {
        this.actualEvent = {
          name: '',
          start: undefined,
          finish: undefined,
          startTime: this.addPreZero(dayTime.hour) + ":00",
          endTime: this.addPreZero(dayTime.hour + 1) + ":00",
        };
        let start = new Date();
        start.setFullYear(dayTime.year, dayTime.month - 1, dayTime.day);
        start.setHours(dayTime.hour, 0, 0, 0);
        this.actualEvent.start = start;

        let finish = new Date(start.getTime());
        finish.setHours(dayTime.hour + 1, 0, 0, 0);
        this.actualEvent.finish = finish;

        this.flipOpen();
      }
    },

    async save() {
      this.validate();
      if (this.valid) {
        if(this.weekly) {
          let event = {
            start: new Date(this.actualEvent.start),
            startTime: this.actualEvent.startTime,
            finish: new Date(this.actualEvent.finish),
            endTime: this.actualEvent.endTime
          }
          while (new Date(this.repeatUntil) > event.start) {
            await this.createReserves(this.getStartAndFinish(event), true);
            event.start.setDate(event.start.getDate() + 7);
            event.finish.setDate(event.finish.getDate() + 7);
          }
        } else {
          await this.createReserves();
        }
        this.cancel();
      }
    },

    getStartAndFinish(event = this.actualEvent) {
      let start = new Date(event.start);
      let time = this.getTimeFromString(event.startTime);
      start.setHours(time.hour, time.minute, 0, 0);

      let finish = new Date(event.finish);
      time = this.getTimeFromString(event.endTime);
      finish.setHours(time.hour, time.minute, 0, 0);

      return {
        start: start,
        finish: finish
      }
    },

    async createReserves(startAndFinish = this.getStartAndFinish(), weekly = false) {
      if(weekly) {
        this.actualEvent = {
          name: this.actualEvent.name,
          start: this.parseDate(startAndFinish.start),
          finish: this.parseDate(startAndFinish.finish),
          attendees_count: this.actualEvent.attendees_count,
          attendees: this.actualEvent.attendees
        };
      } else {
        this.actualEvent = {
          id: this.actualEvent.id,
          name: this.actualEvent.name,
          start: this.parseDate(startAndFinish.start),
          finish: this.parseDate(startAndFinish.finish),
          attendees_count: this.actualEvent.attendees_count,
          attendees: this.actualEvent.attendees
        };
      }

      if (this.actualEvent.id) {
        this.reserves = this.reserves.filter(r => r.id !== this.actualEvent.id);
        this.actualEvent = await putToEndpoint('reserves', this.actualEvent);
      } else {
        this.actualEvent = await postToEndpoint('reserves', this.actualEvent);
      }
      this.reserves.push(this.actualEvent);
    },

    cancel() {
      this.actualEvent = {};
      this.flipOpen();
    },

    remove() {
      if (this.actualEvent.id) {
        deleteToEndpoint('reserves', this.actualEvent.id);
        this.reserves = this.reserves.filter(r => r.id !== this.actualEvent.id);
      }
      this.cancel();
    },

    getTimeFromString(time) {
      let splittedTime = time.split(':');
      return {
        hour: splittedTime[0],
        minute: splittedTime[1]
      }
    },

    validate() {
      this.$refs.form.validate();
    },

    flipOpen() {
      this.dialogOpen = !this.dialogOpen;
      this.weekly = false;
    },
  },
}

</script>

<style scoped>
</style>