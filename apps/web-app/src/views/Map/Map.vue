<template>
  <!-- ak:api密钥 -->
  <!-- zoom:缩放等级 -->
  <!-- scroll-wheel-zoom:允许滚动缩放 -->
  <baidu-map
    class="map"
    ak="4X3Z3qITk1islBa19lBPMqfkMryPVBXu"
    v="3.0"
    type="API"
    :center="{
      lng: pointInfo[pointInfo.length - 1]?.bdLng,
      lat: pointInfo[pointInfo.length - 1]?.bdLat
    }"
    :zoom="15"
    :min-zoom="1"
    :max-zoom="100"
    :scroll-wheel-zoom="true"
    @ready="handlePaint"
  >
    <!-- 比例尺控件 -->
    <bm-scale anchor="BMAP_ANCHOR_BOTTOM_LEFT"></bm-scale>
    <!-- 地图类型
      1.标准地图：BMAP_NORMAL_MAP
2.地球模式：BMAP_EARTH_MAP
3.普通卫星地图：BMAP_SATELLITE_MAP
4.BMAP_HYBRID_MAP:标准地图的标点加上卫星地图（混合模式）
     -->
    <bm-map-type
      :map-types="['BMAP_NORMAL_MAP', 'BMAP_HYBRID_MAP']"
      anchor="BMAP_ANCHOR_TOP_LEFT"
    ></bm-map-type>
    <!-- 版权 -->
    <bm-copyright
      anchor="BMAP_ANCHOR_BOTTOM_RIGHT"
      :copyright="[{ id: 1, content: 'made by sakura' }]"
    ></bm-copyright>
    <!-- 轨迹 -->
    <bm-control>
      <button class="tracePlay" @click.stop="tracePlay">回放</button>
    </bm-control>
    <template v-if="powerShow">
      <bm-polyline
        :path="points"
        stroke-color="#F25C05"
        :stroke-opacity="0.7"
        :stroke-weight="5"
      ></bm-polyline>
      <!-- 步行路线规划
        panel：是否显示检索面板
        autoViewport：检索结束后是否自动调整地图视野
      -->
      <!-- <bm-walking :start="start" :end="end" :panel="false" :autoViewport="true"></bm-walking> -->
      <bm-marker
        v-for="p in pointInfo"
        :key="p?.id"
        :icon="
          p.id == pointInfo[0].id
            ? startIcon
            : p.id == pointInfo[pointInfo.length - 1].id
            ? endIcon
            : passIcon
        "
        :position="{ lng: p?.bdLng, lat: p?.bdLat }"
        @click="showPointDetail(p)"
      >
      </bm-marker>
      <!-- 信息窗口只能存在一个，所以不能放进循环，只能动态改变其坐标和数据来实现点击不同的点显示详情 -->
      <bm-info-window
        :position="{ lng: infoWindow.bdLng, lat: infoWindow.bdLat }"
        :show="show"
        @close="infoWindowClose"
        @open="infoWindowOpen"
      >
        <p>城市：{{ infoWindow.city }}</p>
        <p>地址：{{ infoWindow.address }}</p>
        <p>地址详情：{{ infoWindow.pointDetail }}</p>
        <p>日期时间：{{ infoWindow.dateTime }}</p>
        <p>经度：{{ infoWindow.lng }}</p>
        <p>纬度：{{ infoWindow.lat }}</p>
      </bm-info-window>
      <!-- 轨迹回放
        rotation：icon随路径旋转朝向
        autoView：自动调整路线视野
       -->
      <bml-lushu
        :play="play"
        :autoView="true"
        :path="points"
        :icon="icon"
        :speed="speed"
        :content="powerSips"
      >
      </bml-lushu>
    </template>
  </baidu-map>
</template>

<script setup>
import {
  BaiduMap,
  BmScale,
  BmMapType,
  BmCopyright,
  BmMarker,
  BmInfoWindow,
  BmControl,
  BmPolyline,
  BmlLushu,
  useGeocoder
} from 'vue-baidu-map-3x'
import { ref } from 'vue'
import startImg from '@/assets/image/startPoint.png'
import endImg from '@/assets/image/endPoint.png'
import passImg from '@/assets/image/passPoint.png'
import kuronekoImg from '@/assets/image/kuroneko-wara_small.png'
import { gpsRequest } from '@/service'
const startIcon = ref({ url: startImg, size: { width: 36, height: 59 } })
const endIcon = ref({ url: endImg, size: { width: 30, height: 60 } })
const passIcon = ref({ url: passImg, size: { width: 30, height: 60 } })
const show = ref(false)

const infoWindow = ref({})

const infoWindowClose = () => {
  show.value = false
}
const infoWindowOpen = () => {
  show.value = true
}
//经纬度坐标集
const points = ref([])
//坐标信息
const pointInfo = ref([])
const handlePaint = async ({ BMap }) => {
  //地图加载完成后，有关地图操作都需要在ready中进行
  //ready事件处理函数有俩个参数 BMap,接口核心类，map，地图实例
  //获取未转换百度坐标的列表
  let { data } = await gpsRequest.get({ url: 'gps/down/updateList' })
  if (data.length) {
    //经度dddmm.mmmmm 纬度ddmm.mmmmm 转换为度分
    data.forEach((i) => {
      i.lng = Math.floor(i.lng / 100) + (i.lng % 100) / 60
      i.lat = Math.floor(i.lat / 100) + (i.lat % 100) / 60
    })
    let updateInfo = []
    data.forEach((v) => {
      updateInfo.push({ id: v.id })
    })
    // WGS-84 ddmm.mmmm格式 lng: 11546.89521, lat: 2839.57394
    // WGS-84 dd.dddd格式 115.781586833 28.6595656666
    // 转为百度坐标：115.79308408371 28.662616279916
    const convertor = new BMap.Convertor()
    //参数参考https://lbs.baidu.com/faq/api?title=webapi/guide/changeposition-base
    //参数1为坐标数组，数组长度不能大于10（一次只能处理10个点）
    //参数2为转换的源坐标，1表示GPS坐标（WGS-84）
    //参数3为转换的目标坐标，5表示百度坐标（BD09）
    //参数4回调函数接收转换后的坐标数据{status,points},status为0表示转换成功，points为坐标数据
    //中转数组
    let translateList = []
    const translatedPoints = []
    for (let i = 0; i < data.length; i += 10) {
      translateList = data.slice(i, i + 10)
      const transPoints = await new Promise((resovle) => {
        convertor.translate(translateList, 1, 5, (data) => {
          if (data.status == 0) {
            resovle(data.points)
          }
        })
      })
      translatedPoints.push(...transPoints)
    }
    //获取待更新百度经纬度
    translatedPoints.forEach((v, i) => {
      updateInfo[i].bdLat = v.lat
      updateInfo[i].bdLng = v.lng
    })

    //获取地理位置详情
    //通过useGeocoder获取Geocoder类，该类可以使用
    //getPoint：通过地址获取坐标
    const geocoder = await useGeocoder()
    //getLocation必须接收一个百度坐标对象
    //通过usePoint转为百度坐标对象
    //getLocation：通过坐标获取地址相关信息

    //更新坐标详情
    for (let i = 0; i < translatedPoints.length; i++) {
      const locationInfo = await new Promise((resolve) => {
        geocoder.getLocation(translatedPoints[i], (location) => {
          resolve(location)
        })
      })
      updateInfo[i].address = locationInfo.address
      //todo:天气查询，将爬虫集成到后端接口，前端通过获取最新定位信息，解析后返回城市给后端爬虫，后端再下发给硬件
      updateInfo[i].city = locationInfo.content.address_detail.city
      updateInfo[i].pointDetail = locationInfo.content.poi_desc
    }
    //更新数据库
    await updateInfo.forEach(async (v) => {
      await gpsRequest.patch({
        url: '/gps/update',
        data: {
          id: v.id,
          address: v.address,
          city: v.city,
          pointDetail: v.pointDetail,
          bdLat: v.bdLat,
          bdLng: v.bdLng
        }
      })
    })
  }
  const res = await gpsRequest.get({ url: '/gps/down' })
  // console.log(res.data)
  const pointList = res.data.map((i) => {
    return { lng: i.bdLng, lat: i.bdLat }
  })

  pointInfo.value = res.data
  points.value = pointList
  // console.log(points.value)
}
//控制轨迹显示
const powerShow = ref(true)
const play = ref(false)
const speed = ref(200)
const icon = ref({
  url: kuronekoImg,
  size: {
    width: 59,
    height: 86
  },
  opts: {
    anchor: {
      width: 26,
      height: 80
    }
  }
})
//轨迹播放信息窗口
const powerSips = ref('kuroneko tracking~')
const tracePlay = () => {
  play.value = true
}
const showPointDetail = (pointData) => {
  show.value = true
  infoWindow.value = pointData
}
</script>

<style lang="less">
.map {
  position: absolute;
  top: 60px;
  width: 100%;
  //calc 使用时必须要加单位以及运算符左右需要空格
  height: calc(100vh - 60px);
}
.tracePlay {
  margin-left: 100px;
  margin-top: 10px;
}
</style>
