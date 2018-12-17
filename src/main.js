// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import { sync } from 'vuex-router-sync'
import FastClick from 'fastclick'

import App from './App'
import UserRegister from './pages/UserRegister'
import QuickSearch from './pages/QuickSearch'
import router from './router/index'

import { DatetimePlugin, CloseDialogsPlugin, ConfigPlugin, BusPlugin, DevicePlugin, ToastPlugin, AlertPlugin, ConfirmPlugin, LoadingPlugin, WechatPlugin, AjaxPlugin, AppPlugin, querystring } from 'vux'
import {addAppModule, addDataModule, addSearchModule} from './service/store-service'
import WxcSrv from './service/wxc-service'
import HttpSrv from './service/http-service'
const httpSrv = new HttpSrv();

Vue.use(Vuex);
require('es6-promise').polyfill();

// global VUX config
Vue.use(ConfigPlugin, {
    $layout: 'VIEW_BOX' // global config for VUX, since v2.5.12
});

// plugins
Vue.use(DevicePlugin)
Vue.use(ToastPlugin)
Vue.use(AlertPlugin)
Vue.use(ConfirmPlugin)
Vue.use(LoadingPlugin)
Vue.use(WechatPlugin)
Vue.use(AjaxPlugin)
Vue.use(BusPlugin)
Vue.use(DatetimePlugin)

let store = new Vuex.Store({});

// test
console.table({evn: process.env});
console.log('href:', location.href);
if (process.env.platform === 'app') {
    Vue.use(AppPlugin, store)
}

const initVueSingle = (Page, store) => {
    if (store) {
        addAppModule(store);
    }
    new Vue({
        store: store,
        render: h => h(Page)
    }).$mount('#app-box')
};

const initVueMain = () => {
    addAppModule(store);

    FastClick.attach(document.body)

    /* eslint-disable no-new */
    Vue.use(CloseDialogsPlugin, router)
    sync(store, router)

    // simple history management
    const history = window.sessionStorage
    history.clear()
    let historyCount = history.getItem('count') * 1 || 0
    history.setItem('/', 0)
    let isPush = false
    let endTime = Date.now()
    let methods = ['push', 'go', 'replace', 'forward', 'back']

    document.addEventListener('touchend', () => {
        endTime = Date.now()
    })
    methods.forEach(key => {
        let method = router[key].bind(router)
        router[key] = function (...args) {
            isPush = true
            method.apply(null, args)
        }
    })

    router.beforeEach(function (to, from, next) {
        store.commit('updateLoadingStatus', {isLoading: true})

        const toIndex = history.getItem(to.path)
        const fromIndex = history.getItem(from.path)

        if (toIndex) {
            if (!fromIndex || parseInt(toIndex, 10) > parseInt(fromIndex, 10) || (toIndex === '0' && fromIndex === '0')) {
                store.commit('updateDirection', {direction: 'forward'})
            } else {
                // 判断是否是ios左滑返回
                if (!isPush && (Date.now() - endTime) < 377) {
                    store.commit('updateDirection', {direction: ''})
                } else {
                    store.commit('updateDirection', { direction: 'reverse' })
                }
            }
        } else {
            ++historyCount
            history.setItem('count', historyCount)
            to.path !== '/' && history.setItem(to.path, historyCount)
            store.commit('updateDirection', {direction: 'forward'})
        }

        if (/\/http/.test(to.path)) {
            let url = to.path.split('http')[1]
            window.location.href = `http${url}`
        } else {
            next()
        }
    });

    Vue.config.productionTip = false;

    new Vue({
        store,
        router,
        render: h => h(App)
    }).$mount('#app-box')
};

const getWeChatInfoByCode = async(code) => {
    addDataModule(store);
    console.log('==================================================');
    console.log('getWeChatInfoByCode code:', code);
    console.log('getWeChatInfoByCode wx-auth:', store.state.data.auth);
    console.log('==================================================');

    if (store.state.data.auth && store.state.data.auth.refresh_token) {
        const rtResult = await httpSrv.setPath('/wechat/common')
            .setQuery({
                method: 'clientRefreshToken'
            })
            .setBody({
                refreshToken: store.state.data.auth.refresh_token
            })
            .postReq();

        if (rtResult.errno === 0) {
            store.commit('setAuthData', {auth: rtResult.info});
        }
        console.log('clientRefreshToken => store data wx-auth new:', store.state.data.auth);
    } else {
        const result = await httpSrv.setPath('/wechat/common')
            .setQuery({
                method: 'clientAccessToken'
            })
            .setBody({
                wxCode: code
            })
            .postReq();

        if (result.errno === 0) {
            store.commit('setAuthData', {auth: result.info});
        }
        console.log('clientAccessToken => store data wx-auth new:', store.state.data.auth);
    }

    if (process.env.NODE_ENV === 'production') {
        const ticketResult = await httpSrv.init().setPath('/wechat/common')
            .setQuery({
                method: 'srvGetTicket'
            })
            .postReq();

        if (ticketResult.errno === 0) {
            const jsdkData = WxcSrv.getWxcJSdkData(ticketResult.info);
            Vue.wechat.config(jsdkData);
            Vue.wechat.ready(() => {
                store.commit('setJSdkData', {auth: 'success'});
            });
            Vue.wechat.error(error => {
                store.commit('updateJSdkData', {auth: error});
            });
        }
    }

    if (store.state.data.auth.openid) {
        const ciResult = await httpSrv.init().setPath('/wechat/common')
            .setQuery({
                method: 'clientInfo'
            })
            .setBody({
                accessToken: store.state.data.auth.access_token,
                openId: store.state.data.auth.openid
            })
            .postReq();

        if (ciResult.errno === 0) {
            store.commit('setWxuData', {wxu: ciResult.info});
            console.log('store data wxu:', store.state.data.wxu);
        }

        const loginResult = await httpSrv.init().setPath('/wechatAuth')
            .setBody({
                openId: store.state.data.auth.openid
            })
            .postReq();

        if (loginResult.errno === 0) {
            store.commit('setUserData', {user: loginResult.info});
            localStorage.setItem('auth-token', store.state.data.user.authorization);
            console.log('store user:', store.state.data.user, 'auth-token:', localStorage.getItem('auth-token'));
            initVueMain();
        } else {
            Vue.$vux.toast.text(loginResult.msg, 'middle');
            initVueSingle(UserRegister, store);
        }
    }
};

// const getWeChatInfoByAuth = async(auth) => {
//     addDataModule(store);
//     store.commit('setAuthData', {auth: auth});
//     console.log('getWeChatInfoByAuth wx-auth:', store.state.data.auth);
//
//     if (store.state.data.auth) {
//         let rtResult = await httpSrv.setPath('/wechat/common')
//             .setQuery({
//                 method: 'clientRefreshToken'
//             })
//             .setBody({
//                 refreshToken: store.state.data.auth.refresh_token
//             })
//             .postReq();
//
//         if (rtResult.errno === 0) {
//             store.commit('updateAuthData', {key: 'access_token', val: rtResult.info.access_token});
//             store.commit('updateAuthData', {key: 'refresh_token', val: rtResult.info.refresh_token});
//         }
//     }
//
//     if (process.env.NODE_ENV === 'production') {
//         const wx = Vue.wechat;
//         const ticketResult = await httpSrv.init().setPath('/wechat/common')
//             .setQuery({
//                 method: 'srvGetTicket'
//             })
//             .setBody({
//                 clientUrl: location.href
//             })
//             .postReq();
//
//         if (ticketResult.errno === 0 && ticketResult.info.errcode === 0) {
//             const jsdkData = WxcSrv.getWxcJSdkData(ticketResult.info.ticket);
//             wx.config(jsdkData);
//             wx.ready(() => {
//                 store.commit('updateJSdkData', {key: 'result', val: 'success'});
//             });
//             wx.error((error) => {
//                 store.commit('updateJSdkData', {key: 'result', val: error});
//             });
//         }
//     }
//
//     if (store.state.data.auth.openid) {
//         let ciResult = await httpSrv.init().setPath('/wechat/common')
//             .setQuery({
//                 method: 'clientInfo'
//             })
//             .setBody({
//                 accessToken: store.state.data.auth.access_token,
//                 openId: store.state.data.auth.openid
//             })
//             .postReq();
//
//         if (ciResult.errno === 0) {
//             store.commit('setWxuData', {wxu: ciResult.info});
//             console.log('store data wxu:', store.state.data.wxu);
//         }
//
//         let loginResult = await httpSrv.init().setPath('/wechatAuth')
//             .setBody({
//                 openId: store.state.data.auth.openid
//             })
//             .postReq();
//
//         if (loginResult.errno === 0) {
//             store.commit('setUserData', {user: loginResult.info});
//             localStorage.setItem('auth-token', store.state.data.user.authorization);
//             console.log('store user:', store.state.data.user, 'auth-token:', localStorage.getItem('auth-token'));
//         } else {
//             Vue.$vux.toast.text(loginResult.msg, 'middle');
//             initVueSingle(UserRegister, store);
//         }
//     }
//
//     initVueMain();
// };

const debugMode = async() => {
    addDataModule(store);
    console.log('debugMode');

    if (store.state.data.auth) {
        let rtResult = await httpSrv.setPath('/wechat/common')
            .setQuery({
                method: 'clientRefreshToken'
            })
            .setBody({
                refreshToken: store.state.data.auth.refresh_token
            })
            .postReq();

        if (rtResult.errno === 0) {
            store.commit('updateAuthData', {key: 'access_token', val: rtResult.info.access_token});
            store.commit('updateAuthData', {key: 'refresh_token', val: rtResult.info.refresh_token});
        }
    } else {
        const debugData = {
            access_token: '8_C8Bu4A1vcm5XDpoJnsdhpSahE03G1OaPi9Wd2gTt_k1Aox7FzICZ-tWz2I9jshlOn9wPd_lbkbiEnoS1C8IT2g',
            refresh_token: '8_f_NyUcp6uDM2gP0g4x5Ef3c3mNFf9Zvj_S369H-GWhOhVrmXIwvQlUJ4KvwZwzKATXumx5cztBSgOwR-VWjThQ',
            openid: 'o2sNe0QFbfuIDSabIIdMqbFX4_oY'
        };
        store.commit('setAuthData', {auth: debugData});
        console.log('store debug:', store.state.data.auth);
    }

    if (store.state.data.auth.openid) {
        let ciResult = await httpSrv.init().setPath('/wechat/common')
            .setQuery({
                method: 'clientInfo'
            })
            .setBody({
                accessToken: store.state.data.auth.access_token,
                openId: store.state.data.auth.openid
            })
            .postReq();

        if (ciResult.errno === 0) {
            store.commit('setWxuData', {wxu: ciResult.info});
            console.log('store data wxu:', store.state.data.wxu);
        }

        let loginResult = await httpSrv.init().setPath('/wechatAuth')
            .setBody({
                openId: store.state.data.auth.openid
            })
            .postReq();

        if (loginResult.errno === 0) {
            store.commit('setUserData', {user: loginResult.info});
            localStorage.setItem('auth-token', store.state.data.user.authorization);
            console.log('store user:', store.state.data.user, 'auth-token:', localStorage.getItem('auth-token'));
            initVueMain();
        } else {
            Vue.$vux.toast.text(loginResult.msg, 'middle');
            initVueSingle(UserRegister, store);
        }
    }
};

addSearchModule(store);

const [host, path] = location.href.split('#');

const queryData = querystring.parse(location.search);
if (queryData.state === 'STATE' && queryData.code) {
    getWeChatInfoByCode(queryData.code).then();
} else if (!path || queryData.tag === 'wx') {
    location.href = WxcSrv.getWxcAuthUrl();
// } else if (queryData.tag === 'app') {
//     const {tag, ...auth} = queryData;
//     console.log('from user register tag:', tag, 'auth:', auth);
//     getWeChatInfoByAuth(auth).then();
} else if( queryData.tag === 'debug'){
  //http://localhost:8080/?tag=debug
  debugMode();
}else if (path.indexOf('quick-search') >= 0) {
    addDataModule(store);
    store.commit('setUserData', {user: {}});
    initVueMain();
} else {
    location.href = WxcSrv.getWxcAuthUrl();
}
