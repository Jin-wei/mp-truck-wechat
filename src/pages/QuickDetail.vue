<template>
  <div>
    <group title="根据订舱单号搜索运输记录" style="margin-top: 20px">
      <x-input title="订舱单号" placeholder="请输入订舱单号" novalidate :show-clear="true" v-model="order_booking_no"
               @on-change="onSearchChanged" @on-enter="onSearchSubmit" placeholder-align="right" autocomplete="on"/>
    </group>
    <div style="padding: 10px">
      <flexbox>
        <flexbox-item>
          <x-button @click.native="onSearchCancel" type="default">清空</x-button>
        </flexbox-item>
        <flexbox-item>
          <x-button @click.native="onSearchSubmit" type="primary">搜索</x-button>
        </flexbox-item>
      </flexbox>
    </div>

    <group title="搜索记录" style="margin-top: 20px">
      <cell v-for="item in searchList" :key="item" :title="item" @click.native="onSearchClick(item)"/>
    </group>
  </div>
</template>

<script>
  import { CellFormPreview, Group, Cell, Flexbox, FlexboxItem, Search, XButton, XHeader, XInput,Previewer, TransferDom, dateFormat } from 'vux'
  import { mapState, mapActions } from 'vuex'
  import Constant from '../service/constant-service'
  import HttpSrv from '../service/http-service'
  const httpSrv = new HttpSrv();

  export default {
    components: {
      CellFormPreview,
      Group,
      Cell,
      Flexbox,
      FlexboxItem,
      Search,
      XButton,
      XHeader,
      XInput,
      Previewer
    },
    methods: {
      ...mapActions([
        'showRightOptionAct',
          'setSearchDataAct',
          'cleanSearchDataAct'
      ]),
      callPhone(phone) {
        window.location.href = 'tel:'+phone;
      },
      async getTransOrder() {
        this.orderList = [];
        this.transList = [];
        let orderResult = await httpSrv.init().setPath('/guest/TransNode')
          .setQuery({
            method: 'qo'
          })
          .setBody({
            order_booking_no: this.order_booking_no
          })
          .postReq();

        if (orderResult.errno === 0) {
          const dataList = orderResult.info;
          this.originList = dataList;
          if (dataList.length > 0) {
            this.orderList = dataList.map((item, index) => ({
              order_id: item.order_id,
              order_state: item.order_state,
              title: `柜号：${item.order_container_code}`,
              desc: `封条号：${item.order_seal_code}`,
              weight: `柜重： ${item.order_container_weight}`,
              vehicle: `车牌号： ${item.order_vehicle_num}`,
              name: `司机姓名： ${item.order_taker_name}`,
              phone: `司机电话： ${item.phone}`
            }));
          }
        }
      },
      async getTransDetail(orderId) {
        this.transList = [];
        let orderResult = await httpSrv.init().setPath('/guest/TransNode')
          .setQuery({
            method: 'gq'
          })
          .setBody({
            order_id: orderId
          })
          .postReq();

        if (orderResult.errno === 0) {
          for (const {trans_node_type, created_at, trans_node_address} of orderResult.info) {
            if (trans_node_type == 1 ||
              trans_node_type == 3 ||
              trans_node_type == 4 ||
              trans_node_type == 5 ||
              trans_node_type == 91 ||
              trans_node_type == 92) {
              this.transList.push({
                label: Constant.getTransNoteState(trans_node_type),
                value: `${new Date(created_at).toLocaleString()}&emsp;${trans_node_address}`
              });
            }
          }
        }
      },
      async getLocation(orderId) {
        let locationResult = await httpSrv.init().setPath('/guest/TransNode')
          .setQuery({
            method: 'dl'
          })
          .setBody({
            order_id: orderId
          })
          .postReq();

        let lng = locationResult.info.lng;
        let lat = locationResult.info.lat;

        let map = new AMap.Map('mapContainer', {
          resizeEnable: true,
          center: [lng, lat],
          zoom: 17
        });

        AMap.plugin('AMap.ToolBar',function(){
          let toolbar = new AMap.ToolBar();
          map.addControl(toolbar)
        });

        let marker = new AMap.Marker({
          map: map,
          position: [lng, lat],
          icon: "http://webapi.amap.com/images/car.png",
          offset: new AMap.Pixel(-36, -12),
          autoRotation: true
        });

        let geocoder = new AMap.Geocoder({
          radius: 1000,
          extensions: "all"
        });

        geocoder.getAddress([lng, lat], function(status, result) {
          if (status === 'complete' && result.info === 'OK') {
            let address = result.regeocode.formattedAddress;
            let content = [];
            content.push('<span style="font-size: 14px">' +address+'</span>');
            content.push('<span style="font-size: 14px">' +"("+lng.toFixed(4)+", "+lat.toFixed(4)+")"+'</span>');
            let infoWindow = new AMap.InfoWindow({
              content: content.join("<br/>"),
              offset: {x: 0, y: -5}
            });
            infoWindow.open(map, marker.getPosition());
            marker.on("mouseover", function(e) {
              infoWindow.open(map, marker.getPosition());
            });
          }
        });

        map.setFitView();
      },
      onSearchClick (item) {
          this.setSearchDataAct(item);
          this.$router.back();
      },
      onSearchChanged () {
        console.log('on-change', this.order_booking_no);
      },
      onSearchCancel () {
        this.order_booking_no = null;
        this.orderList = [];
        this.transList = [];
        this.originList = [];
          this.cleanSearchDataAct();
          this.$router.back();
      },
      onSearchSubmit () {
          this.setSearchDataAct(this.order_booking_no);
          const hasSearch = this.searchList.some(item => item === this.order_booking_no);
          if (!hasSearch) {
              this.searchList.unshift(this.order_booking_no);
          }
          if (this.searchList.length > 10) {
              this.searchList.splice(10, this.searchList.length - 10);
          }
          localStorage.setItem('search-store', JSON.stringify(this.searchList));
          this.$router.back();
      },
      onItemSelected(index) {
        let item = this.orderList[index];
        this.orderDtl = item;
        this.getTransDetail(item.order_id);
        if (this.orderDtl.order_state != 90) {
          this.getLocation(item.order_id);
        }
        item = this.originList[index];
        this.photoList = [];
        if (item.order_container_photo_id){
          let imageUrl = httpSrv.init().setPath('/core/file/UploadFile?method=gf').reqUrl
            +'&type=2&order_id='+item.order_id;
          this.photoList.push({src: imageUrl})
        }
        if (item.order_seal_photo_id){
          let imageUrl = httpSrv.init().setPath('/core/file/UploadFile?method=gf').reqUrl
            +'&type=3&order_id='+item.order_id;
          this.photoList.push({src: imageUrl})
        }
      },
      preview (index) {
        this.$refs.previewer.show(index);
      },
    },
    computed: {
      ...mapState({
        mainMenu: state => state.app.mainMenu
      })
    },
    watch: {

    },
    data () {
      return {
          searchList: [],
        results: [],
        order_booking_no: null,
        queryData: null,
        orderList: [],
        transList: [],
        orderDtl: null,
        photoList: [],
        originList: []//订单列表原始数据
      }
    },
    created() {
      this.showRightOptionAct(false);
      const searchStore = localStorage.getItem('search-store');
      if (searchStore) {
          this.searchList = JSON.parse(searchStore);
      }
    }
  }
</script>

<style scoped>
  .photo-list {
    padding-top: 10px;
    padding-bottom: 5px
  }
  .photo-size {
    margin-left: 10px;
    width:70px;
    height:70px;
  }
</style>
