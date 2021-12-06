<template>
<div>
    <a href="#" @click="click">
        {{ loggedIn ? "Logout" : "Login" }}
    </a>
    <div class="popup" v-if="showLogin">
        <div class="popup-body-xs">
            <h2 class="text-center">Login</h2>
            <form class="p-5 mx-auto" @submit.prevent="on_login">
                <p class="color-danger" v-if="error_msg">{{ error_msg }}</p>
                <div class="row">
                    <input class="input-light col mt-4" type="text" name="username" placeholder="name / email" v-model="login.username">
                    <input class="input-light col ms-sm-4 mt-4" type="password" name="password" placeholder="password" v-model="login.password">
                </div>
                <div class="d-flex mt-3">
                    <button class="btn-secondary ms-auto" type="reset" @click="cancel">Cancel</button>
                    <button class="btn-primary ms-4" type="submit">Login</button>
                </div>
            </form>
        </div>
    </div>
</div>
</template>

<script>
import cookie from 'js-cookie';
import axios from 'axios';
import state from '../state';

export default {
    name: "Login",
    data() {
        return {
            loggedIn: false,
            showLogin: false,
            login: {
                username: '',
                password: '',
            },
            error_msg: null,
            state: state.state,
        };
    },
    methods: {
        async click() {
            if (this.loggedIn) {
                try {
                    await fetch("/api/user/logout", {
                        headers: {
                            'XTOKEN': cookie.get('XTOKEN'),
                        },
                    });
                    cookie.remove('XTOKEN');
                    this.loggedIn = false;
                    this.state.logout();
                } catch (error) {
                    console.error(`could not logout: ${error}`)
                }
            } else {
                this.error_msg = null;
                this.showLogin = true;
            }
        },
        cancel() {
            this.login.username = '';
            this.login.password = '';
            this.showLogin = false;
        },
        async on_login() {
            console.log("Logging in...");
            try {
                let response = await axios.post('/api/user/login', {
                    login: this.login.username,
                    password: this.login.password,
                });

                if (response.data.success == true) {
                    this.state.login(response.data.user, response.data.token);
                    this.loggedIn = true;
                    this.showLogin = false;
                    this.error_msg = null;
                    this.login.username = '';
                    this.login.password = '';
                } else {
                    this.error_msg = response.data.error_msg;
                    console.error(response.data);
                }
            } catch (error) {
                let response = error.response;
                if (response.data.msg) {
                    this.error_msg = response.data.msg;
                } else {
                    console.error(error)
                }
            }
        },
    },
    created() {
        if (cookie.get('XTOKEN')) {
            this.loggedIn = true;
        }
    }
}
</script>