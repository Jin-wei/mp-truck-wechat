<template>
    <div>
        <group title="请输入您在车队云管家注册的手机号">
            <x-input title="手机号码" name="mobile" placeholder="请输入手机号码" keyboard="number" is-type="china-mobile" v-model="userPhone"></x-input>
        </group>

        <box gap="10px 10px">
            <x-button @click.native="onUserBind" type="primary">用户绑定</x-button>
        </box>
    </div>
</template>

<script>
    import { XInput, Group, XButton, Box, querystring } from 'vux'
    import { mapState, mapActions } from 'vuex'
    import HttpSrv from '../service/http-service'
    const httpSrv = new HttpSrv();

    export default {
        components: {
            XInput,
            XButton,
            Group,
            Box
        },
        methods: {
            async onUserBind() {
                console.log('phone:', this.userPhone, 'openid:', this.auth.openid);
                if (!this.userPhone) {
                    this.$vux.toast.text('请输入手机号', 'middle');
                    return;
                }

                let userBind = await httpSrv.init().setPath('/wechatBind')
                    .setBody({
                        phone: this.userPhone,
                        openId: this.auth.openid
                    })
                    .showLoader()
                    .postReq();

                if (userBind.errno === 0) {
                    this.$vux.toast.show({
                        type: 'success',
                        text: userBind.msg,
                        position: 'middle'
                    });
                    location.href = `index.html?tag=app&${querystring.stringify(this.auth)}`;
                } else {
                    this.$vux.toast.show({
                        type: 'warn',
                        text: userBind.msg,
                        position: 'middle'
                    });
                }
            }
        },
        computed: {
            ...mapState({
                mainMenu: state => state.app.mainMenu,
                user: state => state.data.user,
                auth: state => state.data.auth
            })
        },
        data() {
            return {
                userPhone: null
            }
        },
        created() {

        }
    }
</script>

<style scoped>

</style>
