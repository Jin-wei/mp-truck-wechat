<template>
    <div>
        <actionsheet :menus="menus" v-model="mainMenu.show" @on-click-menu="onMenuClick"></actionsheet>

        <!--<div style="height: 40px">
            <sticky scroll-box="vux_view_box_body" ref="sticky" :offset="46" :check-sticky-support="false">
                <search
                        @result-click="onSearchClick"
                        @on-change="onSearchChanged"
                        :results="results"
                        v-model="search.order_so_code"
                        position="absolute"
                        auto-scroll-to-top top="46px"
                        @on-focus="onSearchFocus"
                        @on-cancel="onSearchCancel"
                        @on-submit="onSearchSubmit"
                        ref="search">
                </search>
            </sticky>
        </div>-->

        <scroller lock-x scrollbar-y use-pulldown height="-100"
                  :pulldown-config="{content:'下拉刷新',downContent:'下拉刷新',upContent:'释放刷新',loadingContent:'加载中'}"
                  @on-pulldown-loading="onPullDown" v-model="pdStatus">
            <div>
                <panel :header="header" :list="orderList" :type="option"
                       @on-img-error="onImgError"
                       @on-click-header="onHeaderClick"
                       @on-click-footer="onFooterClick">
                </panel>
            </div>
        </scroller>
    </div>
</template>

<script>
    import { Actionsheet, Panel, Group, Scroller, Search, Sticky, dateFormat } from 'vux'
    import { mapState, mapActions } from 'vuex'
    import Constant from '../service/constant-service'
    import HttpSrv from '../service/http-service'
    const httpSrv = new HttpSrv();

    export default {
        components: {
            Actionsheet,
            Panel,
            Group,
            Scroller,
            Search,
            Sticky
        },
        methods: {
            ...mapActions([
                'showRightOptionAct'
            ]),
            getOrderLevel(level) {
                let retVal = '';
                if (this.user.driver_type === '1') {
                    return `【${Constant.getOrderLevel(level)}】`
                }
                return retVal;
            },
            async getOrderList(state) {
                let orderResult = await httpSrv.init().setPath('/core/order/OrderMain')
                    .setQuery({
                        method: 'l'
                    })
                    .setBody({
                        order_taker_id: this.user.user_id,
                        order_state: state,
                        ...this.search
                    })
                    .postReq();

                if (orderResult.errno === 0) {
                    let dataList = orderResult.info.rows;
                    this.orderList = dataList.map((item, index) => ({
                        src: '',
                        title: `${this.getOrderLevel(item.order_level)} SO号：${item.order_so_code}&emsp;&emsp;${Constant.getOrderState(item.order_state)}`,
                        desc: `工厂地址：${item.order_factory_address}`,
                        url: {
                            path: '/order/order-detail',
                            replace: false,
                            query: {
                                order_id: item.order_id
                            }
                        },
                        meta: {
                            // source: `状态：${constant.getOrderState(item.order_state)}`,
                            date: `到厂时间：${dateFormat(new Date(item.order_arrival_time), 'YYYY-MM-DD HH:mm')}`,
                            other: `柜型：${Constant.getContainerSize(item.order_container_size)}${Constant.getContainerShape(item.order_container_shape)}`
                        }
                    }));

                    this.pdStatus.pulldownStatus = 'default';
                    this.header = this.orderList.length > 0 ? '订单列表' : '没有订单';
                }
            },
            onMenuClick(menuKey, menuItem) {
                console.log('onMenuClick key:', menuKey, 'item:', menuItem);
                this.getOrderList(menuKey);
            },
            onSearchClick (item) {
                window.alert('you click the result item: ' + JSON.stringify(item))
            },
            onSearchChanged (val) {
                console.log('on-change', val)
            },
            onSearchFocus () {
                console.log('on focus')
            },
            onSearchCancel () {
                this.search.order_so_code = null;
                this.getOrderList('21,22,26,27');
            },
            onSearchSubmit () {
                console.log('onSearchSubmit:', this.search.order_so_code);
                this.getOrderList('21,22,26,27');
            },
            onImgError (item, $event) {
                console.log(item, $event)
            },
            onHeaderClick() {
                console.log('onHeaderClick')
            },
            onFooterClick() {
                console.log('onFooterClick')
            },
            onItemSelect(item) {
                this.$router.push({path: '/order/order-detail', query: {data: item}});
            },
            onPullDown() {
                this.getOrderList('21,22,26,27');
            }
        },
        computed: {
            ...mapState({
                mainMenu: state => state.app.mainMenu,
                user: state => state.data.user
            })
        },
        watch: {
            mainMenu(data) {
                console.log('watch data:', data);
            }
        },
        data () {
            return {
                menus: [
                    {
                        label: `<span class="menu-title">订单状态</span>`,
                        type: 'info'
                    },
                    {
                        label: '全部',
                        value: '21,22,26,27',
                    },
                    {
                        label: '已接单',
                        value: '21',
                    },
                    {
                        label: '运输中',
                        value: '22',
                    },
                    {
                        label: '到厂',
                        value: '26',
                    },
                    {
                        label: '离厂',
                        value: '27',
                    },
                ],
                results: [],
                search: {
                    order_so_code: null
                },
                pdStatus: {
                    pulldownStatus: 'default'
                },
                option: '4',
                header: '订单列表',
                /*footer: {
                    title: '加载更多'
                },*/
                orderList: []
            }
        },
        created() {
            this.showRightOptionAct(true);
            this.getOrderList('21,22,26,27');
        }
    }
</script>

<style scoped>

</style>
