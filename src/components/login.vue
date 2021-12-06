<template>
<div>
    <a href="#" @click="click">
        {{ loggedIn ? "Logout" : "Login" }}
    </a>
    <div class="popup" v-if="showLogin">
        <div class="popup-body-xs">
            <h2 class="text-center">Login</h2>
            <form v-if="!creatingAccount" class="p-5 mx-auto" @submit.prevent="on_login">
                <p class="color-danger" v-if="error_msg">{{ error_msg }}</p>
                <div class="row">
                    <input class="input-light col mt-4" type="text" name="username" placeholder="name / email" v-model="login.username">
                    <input class="input-light col ms-sm-4 mt-4" type="password" name="password" placeholder="password" v-model="login.password">
                </div>
                <div class="d-flex flex-wrap flex-sm-nowrap mt-3">
                    <button class="btn-secondary col-auto ms-auto order-1" type="reset" @click="cancel">Cancel</button>
                    <button class="btn-primary col-auto ms-4 order-1" type="submit">Login</button>
                    <div class="w-100 w-sm-auto col-sm-auto order-sm-0 order-1 me-4">
                        <a class="color-primary" @click="swapLoginMode" href="#"><small>Create an account</small></a>
                    </div>
                </div>
            </form>
            <form v-else class="p-5 mx-auto" @submit.prevent="on_create">
                <p class="color-danger" v-if="error_msg">{{ error_msg }}</p>
                <div class="row">
                    <input class="input-light col mt-4" type="text" name="name" placeholder="name" v-model="create.name">
                    <input class="input-light col ms-sm-4 mt-4" type="email" name="email" placeholder="email" v-model="create.email">
                </div>
                <p class="color-warning" v-if="pass_warn"><small>{{ pass_warn }}</small></p>
                <div class="row">
                    <input class="input-light col mt-4" type="password" name="password" placeholder="password" v-model="create.password">
                    <input class="input-light col ms-sm-4 mt-4" type="password" name="password_conf" placeholder="confirm password" v-model="create.password_conf">
                </div>
                <div class="d-flex flex-wrap flex-sm-nowrap mt-3">
                    <button class="btn-secondary col-auto ms-auto order-1" type="reset" @click="cancel">Cancel</button>
                    <button class="btn-primary col-auto ms-4 order-1" type="submit">Create Account</button>
                    <div class="w-100 w-sm-auto col-sm-auto order-sm-0 order-1 me-4">
                        <a class="color-primary" @click="swapLoginMode" href="#"><small>Login</small></a>
                    </div>
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
            creatingAccount: false,
            login: {
                username: '',
                password: '',
            },
            create: {
                name: '',
                email: '',
                password: '',
                password_conf: '',
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
            this.creatingAccount = false;
            this.create.password_conf = '';
            this.create.password = '';
            this.create.name = '';
            this.create.email = '';
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
        swapLoginMode() {
            this.creatingAccount = !this.creatingAccount;
        },

        async on_create() {
            try {
                let response = await axios.post('/api/user/create', {
                    name: this.create.name,
                    email: this.create.email,
                    password: this.create.password,
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
        }
    },
    computed: {
        pass_warn() {
            if (this.create.password_conf.length == 0) {
                return null;
            }
            if (this.create.password.length < 8) {
                return 'Password must be at least 8 characters';
            }
            if (this.create.password != this.create.password_conf) {
                return 'Passwords do not match';
            }
            return null;
        }
    },
    created() {
        if (cookie.get('XTOKEN')) {
            this.loggedIn = true;
        }
    }
}
</script>