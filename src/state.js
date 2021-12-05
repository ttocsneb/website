import cookie from 'js-cookie';

let state = {
    isLoggedIn: cookie.get('XTOKEN') != null,
    /**
     * Get the user token for authenticated requests
     * 
     * @returns the user token
     */
    getToken() {
        return cookie.get('XTOKEN');
    },
    /**
     * Set whether the user is logged in
     * 
     * @param {boolean} loggedIn 
     */
    setLoggedIn(loggedIn) {
        this.isLoggedIn = loggedIn;
    }
};

export default {
    state
}