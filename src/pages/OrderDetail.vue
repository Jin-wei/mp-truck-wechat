<template>
  <div>
      <div v-transfer-dom>
          <x-dialog v-model="dialog.show" hide-on-blur>
              <div class="dialog-layout">
                  <div class="title">开始运输确认</div>
                  <group gutter="0" class="input">
                      <x-input class="align-left" title="柜　号：" v-model="dialog.cntnCode" v-if="!orderData.order_container_code"></x-input>
                      <x-input class="align-left" title="封条号：" v-model="dialog.sealCode" v-if="!orderData.order_seal_code"></x-input>
                      <x-input class="align-left" title="柜重(KG)：" v-model="dialog.cntnWeight" v-if="!orderData.order_container_weight"></x-input>
                  </group>
                  <flexbox>
                      <flexbox-item><x-button type="default" @click.native="onDlgConfirm(false)">取消</x-button></flexbox-item>
                      <flexbox-item><x-button type="primary" @click.native="onDlgConfirm(true)">开始</x-button></flexbox-item>
                  </flexbox>
              </div>
          </x-dialog>
      </div>
      <div v-transfer-dom v-show="!order_container_photo_id || !order_seal_photo_id">
          <x-dialog v-model="showWarning">
            <div class="dialog-layout">
              <x-icon class="icon" type="ios-information" size="30"></x-icon>
              <div class="title">提示</div>
              <p style="margin-bottom: 10px">您的箱号图片和封条图片还未上传，建议先上传图片再点击开始运输。</p>
              <flexbox>
                <flexbox-item><x-button type="primary" @click.native="onWarningConfirm(false)">上传图片</x-button></flexbox-item>
                <flexbox-item><x-button type="default" @click.native="onWarningConfirm(true)">继续</x-button></flexbox-item>
              </flexbox>
            </div>
          </x-dialog>
      </div>
      <form-preview :header-label="orderHeader.label" :header-value="orderHeader.value" :body-items="orderDataArray" :footer-buttons="buttons"></form-preview>
      <div v-show="orderData.order_state == 21 || (orderData.order_container_photo_id && orderData.order_seal_photo_id) ">
        <group title="上传箱照片">
          <div>
            <uploader
              :max="1"
              :images="containerImages"
              :handle-click="false"
              :show-header="false"
              :readonly="false"
              :upload-url="uploadUrl"
              name="file"
              :params="containerParams"
              size="small"
              @upload-finish="containerUploadFinish"
            ></uploader>
          </div>
        </group>
        <group title="上传铅封号照片">
          <div>
            <uploader
              :max="1"
              :images="sealImages"
              :handle-click="false"
              :show-header="false"
              :readonly="false"
              :upload-url="uploadUrl"
              name="file"
              :params="sealParams"
              size="small"
              @upload-finish="sealUploadFinish"
            ></uploader>
          </div>
        </group>
      </div>
  </div>
</template>

<script>
    import { Confirm, FormPreview, Flexbox, FlexboxItem, Group, XButton, XDialog, XInput, dateFormat, TransferDom, Panel } from 'vux'
    import { mapState, mapActions } from 'vuex'
    import Constant from '../service/constant-service'
    import HttpService from '../service/http-service'
    const httpSrv = new HttpService();
    import Uploader from '../components/uploader.vue'


    export default {
        components: { Confirm, FormPreview, Flexbox, FlexboxItem, Group, XButton, XDialog, XInput, Uploader, Panel},
        directives: {
            TransferDom
        },
        name: "order-detail",
        methods: {
            ...mapActions([
                'showRightOptionAct'
            ]),
            async getOrderInfo(orderId) {
                let orderResult = await httpSrv.init().setPath('/core/order/OrderMain')
                    .setQuery({
                        method: 'q'
                    })
                    .setBody({
                        order_id: orderId
                    })
                    .postReq();

                console.log('getOrderInfo:', orderResult);
                if (orderResult.errno === 0) {
                    this.orderData = orderResult.info.order;
                    const expense = orderResult.info.expense || {};
                    let extra = orderResult.info.extra || [];
                    let orderIsFinish = (this.orderData.order_state == 90);
                    console.log('order:', this.orderData);
                    console.log('expense:', expense);
                    //计算合计
                    let totalCost = this.orderData.order_vehicle_type == 1 ? expense.order_expense_price_labour : expense.order_expense_price_cost;
                    for (let fee of extra) {
                      if (fee.extra_fee_type_id.toString().startsWith('2')) {
                        totalCost += Number(fee.extra_fee_amount);
                      }
                    }

                    if (this.orderData.order_container_photo_id) {
                      let imageUrl = httpSrv.init().setPath('/core/file/UploadFile?method=gf').reqUrl
                        +'&type=2&order_id='+this.orderData.order_id;
                      this.containerImages = [];
                      this.containerImages.push({url: imageUrl})
                    }

                    if (this.orderData.order_seal_photo_id) {
                      let imageUrl = httpSrv.init().setPath('/core/file/UploadFile?method=gf').reqUrl
                        +'&type=3&order_id='+this.orderData.order_id;
                      this.sealImages = [];
                      this.sealImages.push({url: imageUrl})
                    }

                    if (orderIsFinish) {
                      this.orderHeader = {
                        label: this.orderData.order_so_code,
                        value: `￥${totalCost}`
                      };
                    } else {
                      this.orderHeader = {
                        label: this.orderData.order_so_code,
                        value: `￥${expense.order_expense_price_cost}`
                      };
                    }
                    this.orderDataArray = [];
                    if (!orderIsFinish){
                      this.orderDataArray.push({
                        label: '订单状态',
                        value: Constant.getOrderState(this.orderData.order_state)
                      });
                    }
                    if (this.user.driver_type === '1') {
                        this.orderDataArray.push({
                            label: '订单类型',
                            value: Constant.getOrderLevel(this.orderData.order_level)
                        });
                    }
                    if (!orderIsFinish){
                      this.orderDataArray.push({
                        label: '拿单号',
                        value: this.orderData.order_fetch_code,
                        style:"color:red"
                      });
                      this.orderDataArray.push({
                        label: '柜号',
                        value: this.orderData.order_container_code
                      });
                      this.orderDataArray.push({
                        label: '封条号',
                        value: this.orderData.order_seal_code
                      });
                      this.orderDataArray.push({
                        label: '柜重(KG)',
                        value: this.orderData.order_container_weight
                      });
                      this.orderDataArray.push({
                        label: '提柜地点',
                        value: this.orderData.order_pick_stat_address
                      });
                      this.orderDataArray.push({
                        label: '还柜地点',
                        value: this.orderData.order_return_stat_address
                      });
                    }
                    this.orderDataArray.push({
                        label: '到厂时间',
                        value: dateFormat(new Date(this.orderData.order_arrival_time), 'YYYY-MM-DD HH:mm')
                    });
                    if (!orderIsFinish){
                      this.orderDataArray.push({
                        label: '工厂名称',
                        value: this.orderData.order_factory_name
                      });
                    }
                    this.orderDataArray.push({
                        label: '工厂地址',
                        value: this.orderData.order_factory_address
                    });
                    this.orderDataArray.push({
                      label: '柜型',
                      value: `${Constant.getContainerSize(this.orderData.order_container_size)}${Constant.getContainerShape(this.orderData.order_container_shape)}`
                    });
                    if (!orderIsFinish){
                      this.orderDataArray.push({
                        label: '备注',
                        value: this.orderData.order_remark
                      });
                    }
                    //完成订单显示附加费用
                    if (orderIsFinish) {
                        this.orderDataArray.push({
                          label: '运费',
                          value: expense.order_expense_price_cost
                        });
                        this.orderDataArray.push({
                          label: '提成',
                          value: expense.order_expense_price_labour
                        });
                        if (this.orderData.order_vehicle_type == 1) {
                          this.orderDataArray.push({
                            label: '油量',
                            value: expense.order_expense_oil_cost
                          });
                        }
                        for (let fee of extra) {
                            if (fee.extra_fee_type_id.toString().startsWith('2')) {
                                this.orderDataArray.push({
                                  label: fee.extra_fee_name,
                                  value: fee.extra_fee_amount
                                })
                            }
                        }
                        this.orderDataArray.push({
                          label: '合计',
                          value: totalCost
                        });
                    }

                    if (this.orderData.order_state < 20) {
                        this.buttons = [
                            {
                                style: 'primary',
                                text: '抢单',
                                onButtonClick: () => {
                                    this.onFooterClick(1);
                                }
                            }
                        ];
                    }
                    else if (this.orderData.order_state === 21) {
                        this.buttons = [
                            {
                                style: 'primary',
                                text: '开始运输',
                                onButtonClick: () => {
                                    if (!this.order_container_photo_id || !this.order_seal_photo_id) {
                                      this.showWarning = true;
                                    } else {
                                      this.dialog.show = true;
                                    }
                                }
                            }
                        ];
                    }
                    else if (this.orderData.order_state === 22) {
                        this.buttons = [
                            {
                                style: 'primary',
                                text: '到厂',
                                onButtonClick: () => {
//                                    this.onFooterClick(4);
                                }
                            }
                        ];
                    }
                    else if (this.orderData.order_state === 26) {
                        this.buttons = [
                            {
                                style: 'primary',
                                text: '离厂',
                                onButtonClick: () => {
//                                    this.onFooterClick(5);
                                }
                            }
                        ];
                    }
                    else if (this.orderData.order_state === 27) {
                        this.buttons = [
                            {
                                style: 'primary',
                                text: '还箱',
                                onButtonClick: () => {
//                                    this.onFooterClick(6);
                                }
                            }
                        ];
                    }
                    else if (this.orderData.order_state === 90) {
                        this.buttons = [];
                    }
                    else if (this.orderData.order_state === 0) {
                        this.buttons = [];
                    }
                }
            },
            onFooterClick(event) {
                console.log('onFooterClick event:', event, 'user:', this.user);
                const _this = this;
                const orderId = this.queryData.order_id;
                const userInfo = this.user;
                this.$vux.confirm.show({
                    title: '订单状态变更',
                    content: '确认操作吗？',
                    onShow () {
                        console.log('plugin show')
                    },
                    onHide () {
                        console.log('plugin hide')
                    },
                    onCancel () {
                        console.log('plugin cancel')
                    },
                    async onConfirm () {
                        console.log('plugin confirm');
                        let queryData = null;
                        let bodyData = {};
                        switch (event) {
                            case 1:
                                queryData = 'g';
                                bodyData = {
                                    order_id: orderId,
                                    user_id: userInfo.user_id,
                                    user_name: userInfo.name
                                };
                                break;

                            case 2:
                                queryData = 'cc';
                                bodyData = {
                                    order_id: orderId
                                };
                                break;

                            case 3:
                                queryData = 'st';
                                bodyData = {
                                    order_id: orderId
                                };
                                break;

                            case 4:
                                queryData = 'av';
                                bodyData = {
                                    order_id: orderId
                                };
                                break;

                            case 5:
                                queryData = 'lu';
                                bodyData = {
                                    order_id: orderId
                                };
                                break;

                            case 6:
                                queryData = 'rc';
                                bodyData = {
                                    order_id: orderId
                                };
                                break;
                        }
                        let grabResult = await httpSrv.init().setPath('/core/order/OrderMain')
                            .setQuery({
                                method: queryData
                            })
                            .setBody(bodyData)
                            .showLoader()
                            .postReq();

                        if (grabResult.errno === 0) {
                            _this.$vux.toast.show({
                                text: '操作成功',
                                position: 'middle'
                            });
                            _this.getOrderInfo(orderId);
                        } else {
                            _this.$vux.toast.text(grabResult.msg, 'middle');
                        }
                    }
                })
            },
            async onDlgConfirm(confirm) {
                console.log('onDlgConfirm:', confirm, 'dialog:', this.dialog);
                if (confirm) {
                    let bodyData = {
                        order_id: this.queryData.order_id
                    };
                    if (!this.orderData.order_container_code) {
                        if (this.dialog.cntnCode) {
                            bodyData.order_container_code = this.dialog.cntnCode;
                            const reg = /^[A-Za-z]{4}\d{7}$/;
                            let validate = reg.test(bodyData.order_container_code);
                            if (!validate) {
                                return this.$vux.toast.text('柜号应该由4位字母和7位数字组成,请重新输入！', 'middle')
                            }
                        } else {
                            return this.$vux.toast.text('请输入柜号', 'middle')
                        }
                    }
                    if (!this.orderData.order_seal_code) {
                        if (this.dialog.sealCode) {
                            bodyData.order_seal_code = this.dialog.sealCode;
                        } else {
                            return this.$vux.toast.text('请输入封条号', 'middle')
                        }
                    }

                    if (!this.orderData.order_container_weight) {
                      if (this.dialog.cntnWeight) {
                        bodyData.order_container_weight = this.dialog.cntnWeight;
                        const reg = /^[1-9]\d{0,3}$/;
                        let validate = reg.test(bodyData.order_container_weight);
                        if (!validate) {
                          return this.$vux.toast.text('柜重只允许输入数字！', 'middle')
                        }
                      } else {
                        return this.$vux.toast.text('请输入柜重', 'middle')
                      }
                    }
//                    if (!this.order_container_photo_id || !this.order_seal_photo_id) {
//                        return this.$vux.toast.text('请先上传箱照片和铅封号照片', 'middle')
//                    }
                    bodyData.order_container_photo_id = this.order_container_photo_id;
                    bodyData.order_seal_photo_id = this.order_seal_photo_id;

                  //防止重复请求
                  if (this.dialog.requesting) {
                    console.log('requesting is going');
                    return
                  }
                  this.dialog.requesting = true;
                  if (this.orderData.order_state === 21) {
                    let grabResult = await httpSrv.init().setPath('/core/order/OrderMain')
                      .setQuery({
                        method: 'st'
                      })
                      .setBody(bodyData)
                      .showLoader()
                      .postReq();

                    if (grabResult.errno === 0) {
                      this.$vux.toast.show({
                        text: '操作成功',
                        position: 'middle'
                      });
                      this.dialog.requesting = false;
                      this.dialog.show = false;
                      this.getOrderInfo(this.queryData.order_id);
                    } else {
                      console.log(grabResult.msg);
                    }
                  }
                } else {
                  this.dialog.requesting = false;
                  this.dialog.show = false;
                }
            },
            containerUploadFinish (imageId) {
                this.order_container_photo_id = imageId;
                console.log('order_container_photo_id');
                console.log(this.order_container_photo_id)
            },
            sealUploadFinish(imageId) {
                this.order_seal_photo_id = imageId;
                console.log('order_seal_photo_id');
                console.log(this.order_seal_photo_id);
            },
            onWarningConfirm(state) {
                if (state) {
                    this.dialog.show = true;
                    console.log('继续操作');
                } else {
                    console.log('去上传照片');
                }
                this.showWarning = false;
            }
        },
        computed: {
            ...mapState({
                user: state => state.data.user
            })
        },
        data() {
            return {
                buttons: [],
                queryData: null,
                dialog: {
                    show: false,
                    cntnCode: null,
                    sealCode: null,
                    cntnWeight: null,
                    requesting: false
                },
                showWarning: false,
                orderData: {
                    order_container_code: null,
                    order_seal_code: null,
                    order_container_weight: null
                },
                orderHeader: {
                    label: '',
                    value: ''
                },
                orderDataArray: [],
                uploadUrl: '/core/order/OrderMain/uf',
                containerImages:[],
                sealImages:[],
                containerParams: {},
                sealParams: {},
                order_container_photo_id: null,
                order_seal_photo_id: null
            }
        },
        created() {
            console.log('created:', this.$route.query);
            this.queryData = this.$route.query;
            this.showRightOptionAct(false);
            this.getOrderInfo(this.queryData.order_id);
            this.containerParams = {
              type: 2,
              order_id: this.queryData.order_id
            };
            this.sealParams = {
              type: 3,
              order_id: this.queryData.order_id
            };
        },
        mounted() {
        }
    }
</script>

<style lang="less" scoped>
  @import '~vux/src/styles/weui/widget/weui-uploader/index.less';
  .dialog-layout {
        padding: 10px 10px;
    }
    .title {
      font-size: 20px;
    }
    .input {
      margin: 10px 0;
    }
    .align-left {
      text-align: left;
    }
  .vux-x-icon {
    fill: #f75821;
  }
  .icon {
    position: absolute;
    left: 100px;
  }
</style>
