<template>
  <div class="weui-cell">
    <div class="weui-cell__bd">
      <div class="weui-uploader">
        <div v-show="showHeader" class="weui-uploader__hd">
          <p class="weui-uploader__title"> {{ title }} </p>
          <div v-show="showHeader && showTip" class="weui-uploader__info">
            {{ images.length }} / {{ max }}
          </div>
        </div>

        <div class="weui-uploader__bd" :class="{small: size === 'small'}">
          <!--<div v-show="!readonly && images.length > 0" class="weui-uploader__input-box remove" @click="remove">-->
          <!--</div>-->
          <div v-transfer-dom>
            <previewer :list="list" ref="previewer"></previewer>
          </div>

          <ul class="weui-uploader__files">
            <uploader-item v-for="(image , index) in images" :background-image="image.url" :key="image.url" @click.native="preview(index)"></uploader-item>
          </ul>

          <div v-show="!readonly && images.length < max" class="weui-uploader__input-box" @click="add">
            <input v-if="!handleClick" ref="input" class="weui-uploader__input" type="file" accept="image/*" :capture="showCapture" @change="change">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UploaderItem from './uploader-item.vue'
import HttpService from '../service/http-service'
const httpSrv = new HttpService();
import { Previewer, TransferDom } from 'vux'
import lrz from 'lrz'

export default {
  props: {
    images: {
      type: Array,
      default: () => []
    },
    max: {
      type: Number,
      default: 1
    },
    showHeader: {
      type: Boolean,
      default: true
    },
    showTip: {
      type: Boolean,
      default: true
    },
    readonly: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '图片上传'
    },
    // 是否接管+号的click事件，如果是，点击不弹出选择文件的框
    handleClick: {
      type: Boolean,
      default: false
    },
    // 选择文件后是否自动上传，如果不是，则emit change事件
    autoUpload: {
      type: Boolean,
      default: true
    },
    uploadUrl: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'normal'
    },
    capture: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: 'img'
    },
    params: {
      type: Object,
      default: null
    }
  },
  directives: {
    TransferDom
  },
  components: {
    UploaderItem,
    Previewer
  },
  methods: {
    add () {
      if (this.handleClick) {
        this.$emit('add-image')
      }
    },
    // 移除第一张图
    remove () {
      if (this.handleClick) {
        this.$emit('remove-image')
      } else {
        this.images.shift()
      }
    },
    preview (index) {
      // 暂未实现，可以捕捉preview事件自己实现
      this.$refs.previewer.show(index);
    },
    // 适用于action的情况
    async change () {
      if (this.handleClick) {
        return
      }
      let _self = this;
      if (_self.$vux && _self.$vux.loading) {
        _self.$vux.loading.show('正在上传')
      }
      console.log("原始图片大小:"+(this.$refs.input.files[0].size)/1024+"K");
      /**
       * 图片压缩参数
       * @param width：设置图片最大宽度  quality:比例默认0.7
       * by weijin
       */
      let maxSize = 200 * 1024; //显示图片最大为200k
      let imgSize = this.$refs.input.files[0].size;//获取当前图片的大小
      let lrzParams = {};//图片压缩参数
      if (imgSize > maxSize) {
        lrzParams.width = 800;
        //lrzParams.quality = 0.6;
      }

      lrz(this.$refs.input.files[0],lrzParams).then(async function (rst) {
        console.log("压缩后图片大小:"+rst.file.size/1024+"K");
        let formData = new window.FormData();
        formData.append(_self.name, rst.file);
        if (_self.params) {
          for( let key in _self.params) {
            formData.append(key, _self.params[key])
          }
        }
        if (_self.autoUpload) {
          if (!_self.uploadUrl) {
            console.error('uploadUrl不应为空')
          }
          let response = await httpSrv.init().setPath('/core/order/OrderMain')
            .setQuery({
              method: 'uf',
              type:_self.params.type,
              order_id:_self.params.order_id
            })
            .setBody(formData)
            .postReq();

          if (response.errno === 0) {
            if (_self.$vux && _self.$vux.loading) {
              _self.$vux.loading.hide()
            }
            _self.$emit('upload-finish', response.info.file_id);
            _self.$refs.input.value = '';
            let imageUrl = httpSrv.init().setPath('/core/file/UploadFile?method=gf').reqUrl
              +'&type='+_self.params.type+'&order_id='+_self.params.order_id+'&random='+Math.random();
            _self.images.push({url: imageUrl})
            _self.list.push({
              src: imageUrl
            })
          }
        } else {
          _self.$emit('upload-image', formData)
        }
      });
    }
  },
  data () {
    return {
      list: []
    }
  },
  computed: {
    showCapture () {
      return this.capture || undefined
    }
  },
  watch: {
    images() {
        this.list = [];
        for (let i in this.images) {
            this.list.push({
              src: this.images[i].url
            })
        }
    }
  }
}
</script>
<style scoped lang="less">
@import '~vux/src/styles/weui/widget/weui-uploader/index.less';
.remove:before {
  width: 0;
  height: 0;
}
.weui-uploader__bd.small {
  .weui-uploader__input-box {
    margin-right: 5px;
    margin-bottom: 5px;
    width: 58px;
    height: 58px;
  }
  .weui-uploader__file {
    width: 60px;
    height: 60px;
    margin-right: 5px;
    margin-bottom: 5px;
  }
}
</style>
