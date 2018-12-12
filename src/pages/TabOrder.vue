<template>
    <div>
        <actionsheet :menus="menus" v-model="mainMenu.show" @on-click-menu="onMenuClick"></actionsheet>

      <scroller lock-x scrollbar-y use-pulldown height="-125"
                  :pulldown-config="{content:'下拉刷新',downContent:'下拉刷新',upContent:'释放刷新',loadingContent:'加载中'}"
                  @on-pulldown-loading="onPullDown" v-model="pdStatus">
            <div>
                <panel :header="header" :list="orderList" :type="option"
                       @on-img-error="onImgError"
                       @on-click-header="onHeaderClick">
                </panel>
            </div>
        </scroller>
    </div>
</template>

<script>
    import { Actionsheet, Panel, Scroller, XButton, dateFormat } from 'vux'
    import { mapState, mapActions } from 'vuex'
    import Constant from '../service/constant-service'
    import HttpSrv from '../service/http-service'
    const httpSrv = new HttpSrv();

    export default {
        components: {
            Actionsheet,
            Panel,
            Scroller,
            XButton
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
            async getOrderList() {
                let order_state = null;
                if (this.user.driver_type === '1') {
                    order_state = '11';
                } else if (this.user.driver_type === '2') {
                    order_state = '12';
                } else if (this.user.driver_type === '3') {
                    order_state = '13';
                }
                let orderResult = await httpSrv.init().setPath('/core/order/OrderMain')
                    .setQuery({
                        method: 'gl'
                    })
                    .setBody({
                        order_taker_id: this.user.user_id
                    })
                    .postReq();

                if (orderResult.errno === 0) {
                    let dataList = orderResult.info.rows;
                    this.orderList = dataList.map((item, index) => ({
                        src: '',
                        title: `${this.getOrderLevel(item.order_level)} 业务号：${item.order_so_code}&emsp;&emsp;${Constant.getOrderState(item.order_state)}`,
                        desc: `工厂地址：${item.order_factory_address}`,
                        url: {
                            path: '/order/order-detail',
                            replace: false,
                            query: {
                                order_id: item.order_id
                            }
                        },
                        meta: {
                            // source: '来源信息',
                            date: `到厂时间：${dateFormat(new Date(item.order_arrival_time), 'YYYY-MM-DD HH:mm')}`,
                            other: `柜型：${Constant.getContainerSize(item.order_container_size)}${Constant.getContainerShape(item.order_container_shape)}`
                        }
                    }));

                    this.pdStatus.pulldownStatus = 'default';
                    this.header = this.orderList.length > 0 ? '订单列表' : '没有订单';
                }
            },
            onImgError (item, $event) {
                console.log(item, $event)
            },
            onHeaderClick() {
                console.log('onHeaderClick')
            },
            onItemSelect(item) {
                this.$router.push({path: '/order/order-detail', query: {data: item}});
            },
            onPullDown() {
                this.getOrderList();
            },
            onMenuClick() {
              this.getOrderList();
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
                    label: `<span class="menu-title">是否要刷新列表吗？</span>`,
                    type: 'info'
                  },
                  {
                    label: '立即刷新',
                    value: '',
                  }
                ],
                pdStatus: {
                    pulldownStatus: 'default'
                },
                option: '4',
                header: '订单列表',
                orderList: []
            }
        },
        created() {
            this.showRightOptionAct(true);
            this.getOrderList();
        }
    }
</script>

<style>

</style>
