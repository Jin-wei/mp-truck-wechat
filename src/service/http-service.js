import Vue from 'vue'
import { AjaxPlugin, LoadingPlugin, querystring } from 'vux'

const srvHost = {
    development: 'http://59.111.99.185:9090',
    // production: 'http://120.25.255.195:9090'
    production: 'http://huateng.driver.truckloud.com'
};

const handler = (result) => {
    return result.data;
};

const exception = (error) => {
    console.log('exception:', error);
    // location.href = 'index.html?tag=wx';
};

export default class HttpService {
    constructor(host) {
        if (host) {
            this.host = host;
        } else {
            this.host = `${srvHost[process.env.NODE_ENV]}/api`;
        }
    }

    init() {
        this.query = null;
        this.body = null;
        this.loader = false;
        return this;
    }

    setUrl(url) {
        this.fullUrl = url;
        this.reqUrl = null;
        return this;
    }

    setHost(host) {
        this.host = host;
        return this;
    }

    setPath(path) {
        this.reqUrl = this.host + path;
        this.fullUrl = null;
        return this;
    }

    setQuery(query) {
        if (this.reqUrl) {
            this.reqUrl += `?${querystring.stringify(query)}`;
        } else if (this.fullUrl) {
            this.fullUrl += `?${querystring.stringify(query)}`;
        }
        return this;
    }

    setBody(body) {
        this.body = body;
        return this
    }

    setHeaders(header) {
        this.headers = header;
        return this;
    }

    showLoader() {
        this.loader = true;
        return this;
    }

    getOptions() {
        return {
            headers: {
                ...{
                    authorization: localStorage.getItem('auth-token')
                },
                ...this.headers
            }
        }
    }

    beginReq() {
        if (this.loader) {
            Vue.$vux.loading.show({
                text: 'Loading'
            });
        }
    }

    finishReq() {
        if (this.loader) {
            Vue.$vux.loading.hide();
        }
    }

    async getReq() {
        this.beginReq();
        const result = await AjaxPlugin.$http.get(this.reqUrl || this.fullUrl, this.getOptions())
            .then(result => result.data).catch(error => exception(error));
        this.finishReq();
        return result;
    }

    async postReq() {
        this.beginReq();
        const result = await AjaxPlugin.$http.post(this.reqUrl || this.fullUrl, this.body, this.getOptions())
            .then(result => handler(result)).catch(error => exception(error));
        this.finishReq();
        return result;
    }

    async putReq() {
        this.beginReq();
        const result = await AjaxPlugin.$http.put(this.reqUrl || this.fullUrl, this.body, this.getOptions())
            .then(result => handler(result)).catch(error => exception(error));
        this.finishReq();
        return result;
    }

    async delReq() {
        this.beginReq();
        const result = await AjaxPlugin.$http.delete(this.reqUrl || this.fullUrl, this.getOptions())
            .then(result => handler(result)).catch(error => exception(error));
        this.finishReq();
        return result;
    }

    allReq(reqArray) {
        return AjaxPlugin.$http.all(reqArray).catch(error => exception(error));
    }
}
