import cookie from 'js-cookie';

let user = cookie.get('USER');

let state = {
    isLoggedIn: cookie.get('XTOKEN') != null,
    user: user == null ? null : JSON.parse(user),
    /**
     * Get the user token for authenticated requests
     * 
     * @returns the user token
     */
    getToken() {
        return cookie.get('XTOKEN');
    },
    /**
     * Login the user
     * 
     * @param {object} account 
     * @param {{token: string, expires: number}} token 
     */
    login(account, token) {
        cookie.set('XTOKEN', token.token, {
            expires: new Date(token.expires),
            path: '/',
        });
        cookie.set('USER', JSON.stringify(account), {
            expires: new Date(token.expires),
            path: '/',
        });
        this.isLoggedIn = true;
        this.user = account;
    },
    logout() {
        cookie.remove('XTOKEN');
        cookie.remove('USER');
        this.isLoggedIn = false;
        this.user = null;
    }
};

export default {
    state
}