import Vue from 'vue'
import VueRouter from 'vue-router'
import TabHome from '@/pages/TabHome'
import TabOrder from '@/pages/TabOrder'
import TabUser from '@/pages/TabUser'
import HistoryOrder from '@/pages/HistoryOrder'
import BonusOrder from '@/pages/BonusOrder'
import OrderDetail from '@/pages/OrderDetail'
import UserRegister from '@/pages/UserRegister'
import QuickSearch from '@/pages/QuickSearch'
import QuickDetail from '@/pages/QuickDetail'
import ShareQrCode from '@/pages/ShareQrCode'

Vue.use(VueRouter)

export default new VueRouter({
    routes: [
        {
            path: '/',
            redirect: '/tab-home'
        },
        {
            path: '/tab-home',
            name: '工作台',
            component: TabHome
        },
        {
            path: '/tab-order',
            name: '抢单',
            component: TabOrder
        },
        {
            path: '/tab-user',
            name: '我的',
            component: TabUser
        },
        {
            path: '/history-order',
            name: '历史订单',
            component: HistoryOrder
        },
        {
            path: '/bonus-order',
            name: '绩效积分',
            component: BonusOrder
        },
        {
            path: '/order/order-detail',
            name: '订单详情',
            component: OrderDetail
        },
        {
            path: '/user/register',
            name: '用户绑定',
            component: UserRegister
        },
        {
            path: '/user/qrcode',
            name: '二维码',
            component: ShareQrCode
        },
        {
            path: '/quick-search',
            name: '订单运输详情',
            component: QuickSearch
        },
        {
            path: '/quick-detail',
            name: '订单运输详情',
            component: QuickDetail
        }
    ]
})
