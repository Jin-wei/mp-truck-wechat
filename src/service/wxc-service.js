const crypto = require('crypto');

// let wxd = {
//     authUrl: 'https://open.weixin.qq.com/connect/oauth2/authorize',
//     wxAppId: 'wxb5607375cd5f4af8',
//     wxSecret: '0473d41f8f82e626cd660fe91fce00e7',
//     wxScope: ['snsapi_base', 'snsapi_userinfo'],
//     wxHost: 'http://120.25.255.195:8210/',
// };

let wxd = {
  authUrl: 'https://open.weixin.qq.com/connect/oauth2/authorize',
  wxAppId: 'wx2bc0b814a5ad2728',
  wxSecret: '89eaadb1256baf641b4c7fc07d6f5a9c',
  wxScope: ['snsapi_base', 'snsapi_userinfo'],
  wxHost: 'http://huateng.driver.truckloud.com/',
};

const getNonceStr = () => {
    return Math.random().toString(36).substr(2, 15);
};

const getTimestamp = () => {
    return parseInt(new Date().getTime() / 1000);
};

const sha1 = (value) => {
    let shaStr = crypto.createHash('sha1');
    shaStr.update(value);
    return shaStr.digest('hex');
};

export default {
    getWxcData: () => {
        return wxd;
    },
    getWxcAuthUrl: (path = '') => {
        const redirectUrl = encodeURIComponent(wxd.wxHost + path);
        return `${wxd.authUrl}?appid=${wxd.wxAppId}&redirect_uri=${redirectUrl}&response_type=code&scope=${wxd.wxScope[1]}&state=STATE#wechat_redirect`
    },
    getWxcJSdkData: (ticket) => {
        const timestamp = getTimestamp();
        const nonceStr = getNonceStr();
        const urlStr = location.href.split('#')[0];
        const signStr = `jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${urlStr}`;
        const signature = sha1(signStr);
        console.log('signStr: ', signStr, 'signature:', signature);

        return {
            debug: false,
            appId: wxd.wxAppId,
            timestamp: timestamp,
            nonceStr: nonceStr,
            signature: signature,
            jsApiList: [
                'checkJsApi',
                'getLocation',
                'chooseImage',
                'previewImage',
                'scanQRCode'
            ]
        };
    }
}
