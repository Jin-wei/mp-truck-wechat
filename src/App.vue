<template>
    <div style="height:100%;">
        <!--<div v-transfer-dom>
          <loading v-model="isLoading"></loading>
        </div>-->

        <!-- main content -->
        <view-box ref="viewBox" :body-padding-top="isQuickView ? '0px' : '46px'" body-padding-bottom="55px">
            <div v-show="!isQuickView">
                <div class="logo-div" v-show="user.domain_id == 10001">
                    <img src="./assets/logo-huateng.png" class="logo-image">
                    <span class="logo-tile">华腾云服务</span>
                </div>
                <x-header slot="header"
                          style="width:100%;position:absolute;left:0;top:0;z-index:100;"
                          :left-options="leftOptions"
                          :right-options="rightOptions"
                          :title="title"
                          :transition="headerTransition"
                          @on-click-more="onClickMore">
                </x-header>
            </div>

            <!-- remember to import BusPlugin in main.js if you use components: x-img and sticky -->
            <transition
                    @after-enter="$vux.bus && $vux.bus.$emit('vux:after-view-enter')"
                    :name="viewTransition" :css="!!direction">
                <router-view class="router-view-full" v-if="isQuickView"/>
                <router-view class="router-view" v-else/>
            </transition>

            <tabbar class="vux-demo-tabbar" icon-class="vux-center" v-show="isShowTabBar" slot="bottom">
                <tabbar-item :link="{path: '/tab-home'}" :selected="route.path === '/tab-home'">
                    <span class="demo-icon-22 vux-demo-tabbar-icon-home tabbar-icon" slot="icon">&#xe637;</span>
                    <span slot="label">工作台</span>
                </tabbar-item>
                <tabbar-item :link="{path: '/tab-order'}" :selected="route.path === '/tab-order'">
                    <span class="demo-icon-22 vux-demo-tabbar-icon-home tabbar-icon" slot="icon">&#xe635;</span>
                    <span slot="label">抢单</span>
                </tabbar-item>
                <tabbar-item :link="{path: '/tab-user'}" :selected="route.path === '/tab-user'">
                    <span class="demo-icon-22 vux-demo-tabbar-icon-home tabbar-icon" slot="icon">&#xe633;</span>
                    <span slot="label">我的</span>
                </tabbar-item>
            </tabbar>
        </view-box>
    </div>
</template>

<script>
    import { Badge, Actionsheet, ViewBox, XHeader, Tabbar, TabbarItem, Loading, TransferDom } from 'vux'
    import { mapState, mapActions } from 'vuex'

    export default {
        name: 'app',
        directives: {
            TransferDom
        },
        components: {
            Badge,
            ViewBox,
            XHeader,
            Tabbar,
            TabbarItem,
            Loading,
            Actionsheet
        },
        methods: {
            onClickMore () {
                this.showMenuAction(this.path);
                console.log(`mainMenu path: ${this.path} show: ${this.appStore.mainMenu.show}`);
            },
            ...mapActions([
                'updateDemoPosition',
                'showRightOptionAct',
                'setMenuPathAction',
                'showMenuAction',
                'setUserData'
            ])
        },
        watch: {
            path (path) {
                // if (path === '/tab-user') {
                //   this.$router.replace('/tab-order')
                // }
            }
        },
        computed: {
            ...mapState({
                route: state => state.route,
                path: state => state.route.path,
                appStore: state => state.app,
                isLoading: state => state.app.isLoading,
                direction: state => state.app.direction,
                headerTitle: state => state.app.headerTitle,
                showRightOpt: state => state.app.rightOption,
                dataStore: state => state.data,
                user: state => state.data.user
            }),
            leftOptions () {
                return {
                    showBack: !/tab/.test(this.route.path)
                }
            },
            rightOptions () {
                return {
                    showMore: this.showRightOpt
                }
            },
            headerTransition () {
                if (this.direction) {
                    return this.direction === 'forward' ? 'vux-header-fade-in-right' : 'vux-header-fade-in-left'
                } else {
                    return ''
                }
            },
            isQuickView () {
                return /quick/.test(this.route.path)
            },
            isShowTabBar () {
                return /tab/.test(this.route.path)
            },
            title () {
                return this.headerTitle || this.route.name;
            },
            viewTransition () {
                if (this.direction) {
                    return 'vux-pop-' + (this.direction === 'forward' ? 'in' : 'out')
                } else {
                    return ''
                }
            }
        },
        data () {
            return {

            }
        },
        mounted () {

        },
        beforeDestroy () {

        }
    }
</script>

<style lang="less">
    @import '~vux/src/styles/reset.less';
    @import '~vux/src/styles/1px.less';
    @import '~vux/src/styles/tap.less';

    body {
        background-color: #fbf9fe;
    }
    html, body {
        height: 100%;
        width: 100%;
        overflow-x: hidden;
    }

    .demo-icon-22 {
        font-family: 'vux-demo';
        font-size: 22px;
        color: #888;
    }
    .vux-demo-tabbar .weui-bar__item_on .demo-icon-22 {
        color: #f77300;
    }
    .vux-demo-tabbar .weui-tabbar_item.weui-bar__item_on .vux-demo-tabbar-icon-home {
        color: rgb(53, 73, 94);
    }
    .demo-icon-22:before {
        content: attr(icon);
    }
    .weui-tabbar__icon + .weui-tabbar__label {
        margin-top: 0!important;
    }

    @font-face {
        font-family: 'vux-demo';  /* project id 70323 */
        src: url('https://at.alicdn.com/t/font_h1fz4ogaj5cm1jor.eot');
        src: url('https://at.alicdn.com/t/font_h1fz4ogaj5cm1jor.eot?#iefix') format('embedded-opentype'),
        url('https://at.alicdn.com/t/font_h1fz4ogaj5cm1jor.woff') format('woff'),
        url('https://at.alicdn.com/t/font_h1fz4ogaj5cm1jor.ttf') format('truetype'),
        url('https://at.alicdn.com/t/font_h1fz4ogaj5cm1jor.svg#iconfont') format('svg');
    }

    .tabbar-icon {
        position: relative;
        top: -2px;
    }

    .router-view {
        width: 100%;
        top: 46px;
    }
    .router-view-full {
        width: 100%;
    }
    .menu-title {
        color: #888;
    }
    .logo-div {
      height: 40px;
    }
    .logo-image {
      zoom: 0.1;
    }
    .logo-tile {
      position: absolute;
      top: 55px;
    }
</style>
