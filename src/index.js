import dropdown from './style/dropdown';
import qod from './qod';
import Vue from 'vue';
import Comments from './components/comments.vue';
import Login from './components/login.vue';

const app = new Vue({
    el: '#app',
    components: {
        Comments,
    },
});

const nav = new Vue({
    el: '#nav',
    components: {
        Login,
    },
});
