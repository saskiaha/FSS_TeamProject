import Vue from 'vue';

Vue.component('TheHeader', {
  data: function () {
  },
  template: '<div style="background-color: #99D3ED">ADF Demand Forecast</div>'
})

const app = new Vue ({
  el: '#app'
})