<template>
    <div class="qrcode-layout">
        <qrcode :value="qrCode" type="img"></qrcode>
        <br/>
        <x-img :src="qrCode"></x-img>
    </div>
</template>

<script>
    import { Qrcode, XImg } from 'vux'
    import HttpSrv from '../service/http-service'
    const httpSrv = new HttpSrv();

    export default {
        components: {
            Qrcode,
            XImg
        },
        methods: {
            async getQrCodeTick() {
                const result = await httpSrv.init().setPath('/wechat/common')
                    .setQuery({
                        method: 'srvCreateExpireQrCode'
                    })
                    .setBody({
                        expireHours: 10,
                        sceneStr: 'hello world'
                    })
                    .postReq();

                if (result.errno === 0) {
                    this.qrCode = `https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${result.info.ticket}`;
                }
            }
        },
        data() {
            return {
                qrCode: null,
                qrCode2: null
            }
        },
        created() {
            this.getQrCodeTick();
        }
    }
</script>

<style scoped>
    .qrcode-layout {
        text-align: center;
        margin-top: 20px;
    }
</style>
