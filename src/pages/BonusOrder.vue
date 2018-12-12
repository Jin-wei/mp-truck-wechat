<template>
    <div>
        <button-tab v-model="tabSelect" style="padding: 15px">
            <button-tab-item @on-item-click="onTabSelected">本月</button-tab-item>
            <button-tab-item @on-item-click="onTabSelected">上月</button-tab-item>
        </button-tab>

        <scroller lock-x scrollbar-y use-pulldown height="-86"
                  :pulldown-config="{content:'下拉刷新',downContent:'下拉刷新',upContent:'释放刷新',loadingContent:'加载中'}"
                  @on-pulldown-loading="onPullDown" v-model="pdStatus" ref="scroller">
            <div>
                <panel :header="header" :footer="footer" :list="orderList" :type="option"
                       @on-img-error="onImgError"
                       @on-click-header="onHeaderClick"
                       @on-click-footer="onFooterClick"
                       @on-click-item="onItemClick">
                </panel>
            </div>
        </scroller>

      <div v-transfer-dom >
        <x-dialog v-model="popupShow" :hide-on-blur = 'true'>
          <div class="dialog-layout">
            <p style="margin: 10px 0">
              {{detailMessage.order}}<br/>
              {{detailMessage.source}}<br/>
              {{detailMessage.date}}<br/>
              {{detailMessage.other}}<br/>
            </p>
            <flexbox>
              <flexbox-item> <x-button type="default" @click.native="closeDetailModel()">关闭</x-button></flexbox-item>
            </flexbox>
          </div>
        </x-dialog>
      </div>

    </div>
</template>

<script>
    import { ButtonTab, ButtonTabItem, Panel, Scroller, dateFormat , TransferDom , XDialog , XButton , Flexbox, FlexboxItem,} from 'vux'
    import { mapState, mapActions } from 'vuex'
    import Constant from '../service/constant-service'
    import HttpSrv from '../service/http-service'
    const httpSrv = new HttpSrv();

    export default {
        components: {
            ButtonTab,
            ButtonTabItem,
            Panel,
            Scroller,
            XDialog,
            XButton,
            Flexbox,
            FlexboxItem
        },
        directives: {
          TransferDom
        },
        methods: {
            getOrderLevel(level) {
                let retVal = '';
                if (this.user.driver_type === '1') {
                    return `【${Constant.getOrderLevel(level)}】`
                }
                return retVal;
            },
            async bonusDetail(item) {
                if (item.bonus_history_reason_type === '1') {
                  let messageDetail = {
                    order: `${this.getOrderLevel(item.order_history_level)} SO号：${item.order_history_so_code ? item.order_history_so_code : ''}`,
                    source: `离厂时间：${dateFormat(new Date(item.created_at), 'YYYY-MM-DD HH:mm')}`,
                    other: `工厂地址：${item.order_history_factory_address}`
                  }

                  //获得再次接单时间 start
                  let itemDetail = await httpSrv.init().setPath('/core/bonus/BonusMain')
                    .setQuery({
                      method: 'gnh'
                    })
                    .setBody({
                      order_id: item.order_id
                    })
                    .postReq();

                  if (itemDetail.errno === 0 && itemDetail.info.length > 0) {
                    messageDetail.date = `再次接单时间：${dateFormat(new Date(itemDetail.info[0].created_at), 'YYYY-MM-DD HH:mm')}`
                    return messageDetail
                  } else {
                    return messageDetail
                  }
                  //获得再次接单时间 end

                } else if (item.bonus_history_reason_type === '2') {
                    return {
                        order: `${this.getOrderLevel(item.order_history_level)} SO号：${item.order_history_so_code?item.order_history_so_code:''}`,
                        source: `拒接订单时间：${dateFormat(new Date(item.created_at), 'YYYY-MM-DD HH:mm')}`,
                        other: `工厂地址：${item.order_history_factory_address}`
                    }
                } else if (item.bonus_history_reason_type === '3') {
                    return {
                        order: `${this.getOrderLevel(item.order_history_level)} SO号：${item.order_history_so_code?item.order_history_so_code:''}`,
                        source: `订单要求到厂时间：${dateFormat(new Date(item.order_history_arrival_time), 'YYYY-MM-DD HH:mm')}`,
                        date: `实际到厂时间：${dateFormat(new Date(item.created_at), 'YYYY-MM-DD HH:mm')}`,
                        other: `工厂地址：${item.order_history_factory_address}`
                    }
                }
            },
            async getUserBonus() {
                let curDate = new Date();
                let queryDate = {
                    year: curDate.getFullYear(),
                    month: curDate.getMonth() + 1
                };
                if (this.tabSelect > 0) {
                    let lastDate = new Date();
                    lastDate.setMonth(curDate.getMonth() - 1);
                    queryDate = {
                        year: lastDate.getFullYear(),
                        month: lastDate.getMonth() + 1
                    }
                }
                let bonusResult = await httpSrv.init().setPath('/core/bonus/bonusMain')
                    .setQuery({
                        method: 'qm'
                    })
                    .setBody({
                        user_id: this.user.user_id,
                        ...queryDate
                    })
                    .postReq();

                if (bonusResult.errno === 0) {
                    if (bonusResult.info.rows[0]) {
                        if (this.tabSelect > 0) {
                            this.header = `绩效评分：${bonusResult.info.rows[0].total || 0}`
                        } else {
                            this.header = `初始评分：20&emsp;&emsp;当前评分：${bonusResult.info.rows[0].total || 0}`
                        }
                    }
                }
            },
            async getOrderList() {
                let curDate = new Date();
                let queryData = {
                    createdYear: curDate.getFullYear(),
                    createdMonth: curDate.getMonth() + 1
                };
                if (this.tabSelect > 0) {
                    let lastDate = new Date();
                    lastDate.setMonth(curDate.getMonth() - 1);
                    queryData = {
                        createdYear: lastDate.getFullYear(),
                        createdMonth: lastDate.getMonth() + 1
                    }
                }
                let orderResult = await httpSrv.init().setPath('/core/order/OrderHistory')
                    .setQuery({
                        method: 'lb'
                    })
                    .setBody({
                      order_taker_id: this.user.user_id,
                      ...queryData
                    })
                    .postReq();

                if (orderResult.errno === 0) {
                    let dataList = orderResult.info.rows;
                    this.orderList = dataList.map((item, index) => ({
                        src: '',
                        desc: `${this.getOrderLevel(item.order_history_level)} SO号：${item.order_history_so_code?item.order_history_so_code:''}`,
                        title: `${item.bonus_history_reason_desc?item.bonus_history_reason_desc:''}：${item.bonus_history_change?item.bonus_history_change:''}分`,
                        url: null,
                        data: item
                    }));

                    this.pdStatus.pulldownStatus = 'default';
                    this.$nextTick(() => {
                        this.$refs.scroller.reset({
                            top: 0
                        })
                    });
                }
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
            //列表点击
            async onItemClick(item){
              let _self = this;
              _self.popupShow = true;
              _self.detailMessage = {};
              _self.detailMessage = await _self.bonusDetail(item.data);
            },
            onItemSelect(item) {
                this.$router.push({path: '/order/order-detail', query: {data: item}});
            },
            onPullDown() {
                this.getOrderList();
            },
            onTabSelected() {
                console.log('onTabSelected:', this.tabSelect);
                this.getUserBonus();
                this.getOrderList();
            },
            //关闭详情弹窗
            closeDetailModel() {
              let _self = this;
              _self.popupShow = false;
            }
        },
        computed: {
            ...mapState({
                mainMenu: state => state.app.mainMenu,
                user: state => state.data.user
            })
        },
        data() {
            return {
                tabSelect: 0,
                pdStatus: {
                    pulldownStatus: 'default'
                },
                option: '4',
                header: '积分列表',
                footer: {
                    title: '加载更多'
                },
                queryData: null,
                orderList: [],
                popupShow:false,
                detailMessage:''
            }
        },
        created() {
            this.getUserBonus();
            this.getOrderList();
        }
    }
</script>

<style scoped>

</style>
