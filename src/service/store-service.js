import Vue from 'vue'
import vuexI18n from 'vuex-i18n'
import { LocalePlugin, cookie } from 'vux'

const setItem = (key, val) => {
    localStorage.setItem(key, val);
};

const getItem = (key) => {
    return localStorage.getItem(key);
};

const setObject = (key, object) => {
    localStorage.setItem(key, JSON.stringify(object));
};

const getObject = (key) => {
    const store = localStorage.getItem(key);
    return store ? JSON.parse(store) : null
};

const setWxAuthData = (key, val) => {
    let nowDate = new Date();
    console.log(nowDate.toLocaleString());
    nowDate = nowDate.setMinutes(nowDate.getMinutes() + 119);
    nowDate = new Date(nowDate);
    console.log(nowDate.toLocaleString());

    cookie.set(key, JSON.stringify(val), {
        domain: 'huateng.driver.truckloud.com',
        path: '/',
        expires: nowDate
    })
};

const getWxAuthData = (key) => {
    return cookie.get(key, (val) => {
        if (val) {
            return JSON.parse(val);
        } else {
            return null;
        }
    });
};

export function addSearchModule(store) {
    store.registerModule('search', {
        state: {
            searchData: null,
        },
        mutations: {
            setSearchData (state, payload) {
                state.searchData = payload.searchData;
            },
            cleanSearchData (state, payload) {
                state.searchData = payload.searchData;
            }
        },
        actions: {
            setSearchDataAct ({commit}, searchData) {
                commit({type: 'setSearchData', searchData})
            },
            cleanSearchDataAct ({commit}) {
                commit({type: 'cleanSearchData', searchData: null})
            }
        }
    })
}

export function addAppModule(store) {
    store.registerModule('app', {
        state: {
            demoScrollTop: 0,
            isLoading: false,
            direction: 'forward',
            headerTitle: '',
            leftOption: true,
            rightOption: false,
            mainMenu: {
                path: '/',
                show: false
            }
        },
        mutations: {
            updateDemoPosition (state, payload) {
                state.demoScrollTop = payload.top
            },
            updateLoadingStatus (state, payload) {
                state.isLoading = payload.isLoading
            },
            updateDirection (state, payload) {
                state.direction = payload.direction
            },
            setHeaderTitle (state, payload) {
                state.headerTitle = payload.title
            },
            showLeftOption (state, payload) {
                state.leftOption = payload.status
            },
            showRightOption (state, payload) {
                state.rightOption = payload.status
            },
            setMenuPath (state, payload) {
                state.mainMenu.path = payload.path
            },
            showMenu (state, payload) {
                state.mainMenu.path = payload.path;
                state.mainMenu.show = !state.mainMenu.show;
            }
        },
        actions: {
            updateDemoPosition ({commit}, top) {
                commit({type: 'updateDemoPosition', top: top})
            },
            setHeaderTitleAct({commit}, payload) {
                commit({type: 'setHeaderTitle', title: payload})
            },
            showLeftOptionAct({commit}, payload) {
                commit({type: 'showLeftOption', status: payload})
            },
            showRightOptionAct({commit}, payload) {
                commit({type: 'showRightOption', status: payload})
            },
            setMenuPathAction({commit}, payload) {
                commit({type: 'setMenuPath', path: payload})
            },
            showMenuAction({commit}, payload) {
                commit({type: 'showMenu', path: payload})
            }
        }
    })
}

export function addI10nModule(store) {
    store.registerModule('i18n', vuexI18n.store)
    Vue.use(vuexI18n.plugin, store)

    // const vuxLocales = require('json-loader!yaml-loader!./locales/all.yml')
    // const componentsLocales = require('json-loader!yaml-loader!./locales/components.yml')
    //
    // const finalLocales = {
    //   'en': objectAssign(vuxLocales['en'], componentsLocales['en']),
    //   'zh-CN': objectAssign(vuxLocales['zh-CN'], componentsLocales['zh-CN'])
    // }
    //
    // for (let i in finalLocales) {
    //   Vue.i18n.add(i, finalLocales[i])
    // }
    //
    // Vue.use(LocalePlugin)
    // const nowLocale = Vue.locale.get()
    // if (/zh/.test(nowLocale)) {
    //   Vue.i18n.set('zh-CN')
    // } else {
    //   Vue.i18n.set('en')
    // }
}

export function addDataModule(store, payload = {auth: getWxAuthData('wx-auth'), wxu: null, user: null, jssdk: null}) {
    store.registerModule('data', {
        state: {
            ...payload
        },
        mutations: {
            setAuthData (state, payload) {
                state.auth = payload.auth;
                setWxAuthData('wx-auth', payload.auth);
            },
            updateAuthData (state, payload) {
                console.log(payload);
                state.auth[payload.key] = payload.val
            },
            cleanAuthData (state) {
                state.auth = null;
                localStorage.clear();
            },
            setWxuData (state, payload) {
                state.wxu = payload.wxu
            },
            setUserData (state, payload) {
                state.user = payload.user
            },
            updateUserData (state, payload) {
                state.user[payload.user.key] = payload.user.val
            },
            setJSdkData (state, payload) {
                state.jssdk = payload.jssdk
            },
        },
        actions: {
            setAuthData ({commit}, payload) {
                commit({type: 'setAuthData', auth: payload})
            },
            updateAuthData ({commit}, payload) {
                commit({type: 'updateAuthData', auth: payload})
            },
            cleanAuthData ({commit}) {
                commit({type: 'cleanAuthData'})
            },
            setWxuData ({commit}, payload) {
                commit({type: 'setWxuData', wxu: payload})
            },
            setUserData ({commit}, payload) {
                commit({type: 'setUserData', user: payload})
            },
            updateUserData ({commit}, payload) {
                commit({type: 'updateUserData', user: payload})
            },
            updateJSdkData ({commit}, payload) {
                commit({type: 'updateJSdkData', jssdk: payload})
            }
        }
    })
}
