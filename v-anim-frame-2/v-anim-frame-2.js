import {createComponent} from '@mpxjs/core'

let mem = {
  time: 0
}

createComponent({
  options: {
    styleIsolation: 'isolated',
  },
  properties: {
    reverse: {
      type: Boolean,
      value: false
    },

    unit: {
      type: String, // 用rpx单位不容易产生抖动
      value: 'rpx'
    },

    pause: {
      type: Boolean,
      value: false
    },

    url: {
      type: String,
      value: ""
    },

    count: {
      type: String,
      value: 0
    },

    width: {
      type: String,
      value: 0
    },

    height: {
      type: String,
      value: 0
    },

    duration: {
      type: String,
      value: 0
    },

    loop: { // 动画循环次数，可传 infinite|数字
      type: String,
      value: 'infinite',
    },

    pointerEvents: {
      type: String,
      value: 'auto',
    }
  },

  observers: {
    'infinite': function (val) {
      if (val === 'infinite') { // 重新开始
        this.setData({
          status: ''
        })
        mem.time = 0;
      } else { // 准备暂停
        this.setData({
          status: 'ending'
        })
      }
    }
  },

  data: {
    status: ''
  },

  methods: {
    animEnd() {
      console.log('end');
      this.setData({
        status: 'end'
      })
      mem.time = 0;
      this.triggerEvent('animend', {data: mem.time});
    },
    animIteration(e) {
      // console.log('animIteration', e);
      mem.time++;
      this.triggerEvent('animiteration', {data: mem.time});
    }
  }
})
