<template>
    <div>
        <group :gutter="0">
            <cell :title="driver_phone">
            <!--<cell :title="driver_phone" :inline-desc="driver_team" value="详情" is-link @click.native="onItemSelected(0)">-->
                <div slot="after-title">{{driver_name}}</div>
                <img :src="user.avatar" slot="icon" width="80" class="user-layout" v-if="user && user.avatar">
                <img :src="wxu.headimgurl" slot="icon" width="80" class="user-layout" v-else-if="wxu && wxu.headimgurl">
                <img src="../assets/demo/1.jpg" slot="icon" width="80" class="user-layout" v-else>
            </cell>
        </group>

        <group :gutter="10">
            <cell title="绩效评分" :value="userBonus" is-link @click.native="onItemSelected(1)"></cell>
            <cell-box is-link @click.native="onItemSelected(10)">30天内订单情况查询</cell-box>
            <cell-box is-link @click.native="onItemSelected(11)">历史订单</cell-box>
            <!--<cell-box is-link @click.native="onItemSelected(20)">地理位置</cell-box>-->
            <!--<cell-box is-link @click.native="onItemSelected(21)">选择图片</cell-box>-->
            <!--<cell-box is-link @click.native="onItemSelected(22)">扫一扫</cell-box>-->
            <!--<cell-box is-link @click.native="onItemSelected(23)">二维码</cell-box>-->
            <cell-box is-link @click.native="onItemSelected(90)">退出</cell-box>
        </group>
    </div>
</template>

<script>
    import { Group, Cell, CellBox } from 'vux'
    import { mapState, mapActions } from 'vuex'
    import HttpSrv from '../service/http-service'
    const httpSrv = new HttpSrv();

    export default {
        components: {
            Cell,
            CellBox,
            Group
        },
        methods: {
            ...mapActions([
                'showRightOptionAct',
                'setUserData',
                'updateUserData',
                'cleanAuthData'
            ]),
            async getUserBonus() {
                const curDate = new Date();
                let bonusResult = await httpSrv.init().setPath('/core/bonus/bonusMain')
                    .setQuery({
                        method: 'qm'
                    })
                    .setBody({
                        user_id: this.user.user_id,
                        year: curDate.getFullYear(),
                        month: curDate.getMonth() + 1
                    })
                    .postReq();

                if (bonusResult.errno === 0) {
                    if (bonusResult.info.rows[0]) {
                        this.userBonus = bonusResult.info.rows[0].total || 0;
                    }
                }
            },
            onItemSelected(event) {
                console.log('onItemSelected:', event);
                switch (event) {
                    case 0:
                        break;

                    case 1:
                        this.$router.push({path: '/bonus-order', query: {}});
                        break;

                    case 10:
                        this.$router.push({path: '/history-order', query: {state: 'finish'}});
                        break;

                    case 11:
                        this.$router.push({path: '/history-order', query: {state: 'history'}});
                        break;

                    case 20:
                        this.$wechat.getLocation({
                            type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
                            success: (res) => {
                                const latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
                                const longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
                                const speed = res.speed; // 速度，以米/每秒计
                                const accuracy = res.accuracy; // 位置精度
                                alert(JSON.stringify(res));
                            }
                        });
                        break;

                    case 21:
                        this.$wechat.chooseImage({
                            // count: 1, // 默认9
                            sizeType: ['original', 'compressed'],
                            sourceType: ['album', 'camera'],
                            success: (res) => {
                                const localIds = res.localIds;
                            }
                        });
                        break;

                    case 22:
                        this.$wechat.scanQRCode({
                            needResult: 1,
                            scanType: ['qrCode', 'barCode'],
                            success: (res) => {
                                const result = res.resultStr;
                            }
                        });
                        break;

                    case 23:
                        this.$router.push({path: '/user/qrcode', query: {}});
                        break;

                    case 90:
                        this.$wechat.closeWindow();
                        break;
                }
            }
        },
        computed: {
            ...mapState({
                user: state => state.data.user,
                driver_phone: state => `司机账号：${state.data.user.driver_phone}`,
                driver_name: state => `司机姓名：${state.data.user.driver_name}`,
                driver_team: state => `所属车队：${state.data.user.description}`,
                wxu: state => state.data.wxu
            })
        },
        data() {
            return {
                demo_header: '../assets/demo/1.jpg',
                userBonus: 0
            }
        },
        created() {
            this.showRightOptionAct(false);
            this.getUserBonus();
            console.log('tab-user created user:', this.user, 'wxu:', this.wxu)
        }
    }
</script>

<style scoped>
    .user-layout {
        margin-right: 10px;
    }
</style>
