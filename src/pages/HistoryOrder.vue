<template>
    <div>
        <actionsheet :menus="menus" v-model="mainMenu.show" @on-click-menu="onMenuClick"></actionsheet>

        <div v-if="queryData.state === 'finish'" style="height: 40px">
            <sticky scroll-box="vux_view_box_body" ref="sticky" :offset="46" :check-sticky-support="false">
                <search
                        @result-click="onSearchClick"
                        @on-change="onSearchChanged"
                        placeholder="请输入车牌号"
                        :results="results"
                        v-model="search.order_vehicle_num"
                        position="absolute"
                        auto-scroll-to-top top="46px"
                        @on-focus="onSearchFocus"
                        @on-cancel="onSearchCancel"
                        @on-submit="onSearchSubmit"
                        ref="search">
                </search>
            </sticky>
        </div>

        <scroller lock-x scrollbar-y use-pulldown :height="scrollHeight"
                  :pulldown-config="{content:'下拉刷新',downContent:'下拉刷新',upContent:'释放刷新',loadingContent:'加载中'}"
                  @on-pulldown-loading="onPullDown" v-model="pdStatus" ref="scroller">
            <div>
                <panel :header="header" :footer="footer" :list="orderList" :type="option"
                       @on-img-error="onImgError"
                       @on-click-header="onHeaderClick"
                       @on-click-footer="onFooterClick">
                </panel>
            </div>
        </scroller>
    </div>
</template>

<script>
    import { Actionsheet, Panel, Scroller, Search, Sticky, XButton, dateFormat } from 'vux'
    import { mapState, mapActions } from 'vuex'
    import Constant from '../service/constant-service'
    import HttpSrv from '../service/http-service'
    const httpSrv = new HttpSrv();

    export default {
        components: {
            Actionsheet,
            Panel,
            Scroller,
            Search,
            Sticky,
            XButton
        },
        methods: {
            ...mapActions([
                'setHeaderTitleAct',
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
                let bodyData = null;
                if (this.queryData.state === 'finish') {
                    const curDate = new Date();
                    let bfrDate = new Date();
                    bfrDate.setDate(curDate.getDate() - 30);
                    bodyData = {
                        order_state: state,
                        order_level: 11,
                        order_completed_at_start: bfrDate.toLocaleDateString(),
                        order_completed_at_end: curDate.toLocaleDateString(),
                        ...this.search
                    };
                } else if (this.queryData.state === 'history') {
                    bodyData = {
                        order_taker_id: this.user.user_id,
                        order_state: state
                    };
                }
                let orderResult = await httpSrv.init().setPath('/core/order/OrderMain')
                    .setQuery({
                        method: 'l'
                    })
                    .setBody({
                        ...bodyData
                    })
                    .postReq();

                if (orderResult.errno === 0) {
                    let dataList = orderResult.info.rows;
                    this.orderList = dataList.map((item, index) => ({
                        src: '',
                        title: `${this.getOrderLevel(item.order_level)} 业务号：${item.order_so_code}`,
                        desc: `工厂地址：${item.order_factory_address}`,
                        url: this.queryData.state === 'history' && item.order_state > 0 ? {
                            path: '/order/order-detail',
                            replace: false,
                            query: {
                                order_id: item.order_id
                            }
                        } : null,
                        meta: {
                            source: `到厂时间：${dateFormat(new Date(item.order_arrival_time), 'YYYY-MM-DD HH:mm')}`,
                            date: `柜型：${Constant.getContainerSize(item.order_container_size)}${Constant.getContainerShape(item.order_container_shape)}`,
                            other: this.queryData.state === 'finish' ? `车牌号：${item.order_vehicle_num}` : null
                        }
                    }));

                    this.header = this.orderList.length > 0 ? '订单列表' : '没有订单';
                    this.pdStatus.pulldownStatus = 'default';
                    this.$nextTick(() => {
                        this.$refs.scroller.reset({
                            top: 0
                        })
                    });
                }
            },
            onMenuClick(menuKey, menuItem) {
                console.log('onMenuClick:', menuKey);
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
                this.search.order_vehicle_num = null;
                this.getOrderList(this.reqType[this.queryData.state]);
            },
            onSearchSubmit () {
                this.getOrderList(this.reqType[this.queryData.state]);
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
                if (this.queryData.state === 'history') {
                    this.$router.push({path: '/order/order-detail', query: {data: item}});
                }
            },
            onPullDown() {
                this.search.order_vehicle_num = null;
                this.getOrderList(this.reqType[this.queryData.state]);
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
                menus: [],
                doneMenus: [
                    {
                        label: `<span class="menu-title">订单状态</span>`,
                        type: 'info'
                    },
                    {
                        label: '全部',
                        value: '0,90',
                    },
                    {
                        label: '已完成',
                        value: '90',
                    },
                    {
                        label: '已取消',
                        value: '0',
                    },
                ],
                results: [],
                search: {
                    order_vehicle_num: null
                },
                reqType: {
                    finish: '90',
                    history: '0,90'
                },
                pdStatus: {
                    pulldownStatus: 'default'
                },
                scrollHeight: '-46',
                option: '4',
                header: '订单列表',
                footer: {
                    title: '加载更多'
                },
                queryData: null,
                orderList: []
            }
        },
        created() {
            this.queryData = this.$route.query;
            console.log('queryData:', this.queryData, 'req:', this.reqType[this.queryData.state]);
            if (this.queryData.state === 'finish') {
                this.scrollHeight = '-86';
                this.setHeaderTitleAct('30天内订单情况查询');
                this.showRightOptionAct(false);
            } else if (this.queryData.state === 'history') {
                this.menus = [...this.doneMenus];
                this.showRightOptionAct(true);
            }
            this.getOrderList(this.reqType[this.queryData.state]);
        },
        destroyed() {
            this.setHeaderTitleAct('');
        }
    }
</script>

<style scoped>

</style>
