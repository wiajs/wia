/**
 * 百度地图封装
 * 使用：
 *
 * 1. 百度地图开放平台(`http://lbsyun.baidu.com/`)，注册账户。
 *    进入地图开放平台，应用管理里面的我的应用，创建应用。
 *    选择 浏览器端，输入项目名称，创建成功后生成应用 key，比如 eTrip 的 ak：
 *    应用 AK：AsOWTPuxmvBetfxXCT9GRzCo6MLVQyi5
 * 2. 百度地图开放平台设置Referer 白名单，如wia设置为：\*.wia.pub\*
 *    只有白名单里面的域名网页，才能访问。
 *    设置为 \* 表示任何域名网站都能访问，被其他应用访问，次数过多，百度可能收费或封锁
 * 3. import Map from '@wiajs/lib/bmap'
 * 4. _map = new Map(_self, {ak: _ak, el: 'adjust-map'});
 *    _selft: 当前Page 实例。
 *    ak：第一步申请的应用key
 *    el：页面显示地图的 div 层的id，注意，需带上page名称，避免重名冲突
 * 5. _map.show(center = null, geo = true, points = null)
 *    point：默认为当前手机位置，注意，获取手机当前位置，必须为https协议。
 *    geo：获得当前位置的地理信息，比如建筑之类的，默认为 true
 *    points：标注在地图上的点，当前未实现。   
 * 6. show事件与周边搜索
 *    如果在地图显示时，需要搜索附近，需监听 show事件，事件处理函数中执行 search
      _map.on('show', async point => {
        let ps = await _map.nearby(
          ['公司', '小区', '写字楼', '交叉路口', '银行', '餐厅'],
          point,
          500
        );
      });
      keys：搜索关键字
      point：中心点
      raduis：半径，单位米
 *  7. around 事件
      let geo;
      _map.on('around', v => {
        geo = v;
        _.name('addr').html(v[0].title);
      });
 *  8. 事件数据
      {
        keyword: 关键字,
        dist：距离，单位米
        title: 标题
        address: 地址
        province：省
        city：城市
        district：区
        town：镇
        street：街道
        streetNumber：街道号
        point: {lng, lat}，经、维度，百度格式，gps格式已转换为百度格式
        id: 百度uid
      }
 *  9. nearby 搜索周边
 *  7. search 按城市搜索关键字
 *  10. center 调整地图中心点，需确保地图已加载
 */

import {Event} from '@wiajs/core';

/* globals 
  BMap,
  BMAP_NAVIGATION_CONTROL_SMALL,
  BMAP_STATUS_SUCCESS,
*/

const _scid = '__baidumap';

const def = {
  navigation: false,
  around: true,
};

export default class Map extends Event {
  constructor(page, opt) {
    super(opt, [page]);

    this.opt = {...def, ...opt};
    const {ak, el} = opt;
    this.ak = ak;
    this.el = el;
    this.page = page;

    // 页面退出时，删除地图引用
    // page.on('hide', () => {
    //   const n = $(`#${_scid}`);
    //   if (n.length) {
    //     let ns = n.nextAll('script');
    //     ns = ns.filter((i, v) =>
    //       $(v).attr('src').includes('api.map.baidu.com')
    //     );
    //     ns.remove();
    //     n.remove();
    //   }
    // });
    this.loadMap();
  }

  /**
   * 加载百度地图
   */
  loadMap() {
    if (!this.map) {
      window.__baiduMapReady = () => {
        this.map = new BMap.Map(this.el);
        this.emit('local::ready bmapReady', this.map);
      };

      if (!$.id(_scid)) {
        const script = document.createElement('script');
        script.id = _scid;
        script.src = `http://api.map.baidu.com/api?v=3.0&ak=${this.ak}&callback=__baiduMapReady`;
        document.body.appendChild(script);
        // debugger;
        // this.page.view.append(script);
      } else {
        this.map = new BMap.Map(this.el);
        this.emit('local::ready bmapReady', this.map);
      }
    }
  }

  /**
   * BMap已经加载，将body的脚本引用删除，避免干扰其他层
   */
  removeSc() {
    const n = $(`#${_scid}`);
    if (n.length) {
      let ns = n.nextAll('script');
      ns = ns.filter((i, v) => $(v).attr('src').includes('api.map.baidu.com'));
      ns.remove();
      n.remove();
    }
  }

  getMap() {
    return new Promise((res, rej) => {
      if (this.map) res(this.map);
      else {
        let i = 0;
        const tm = setInterval(async () => {
          i++;
          console.log('setInterval', {i});
          if (i >= 100) rej(new Error('加载百度地图失败！'));
          else if (this.map) {
            clearInterval(tm);
            res(this.map);
            $.nextTick(this.removeSc);
          }
        }, 40);
      }
    });
  }

  /**
   * 显示地图
   * @param {object} center 中心点，数组[经, 纬] or {lng: 经, lat: 维}
   * @param {boolean} around 查询周边
   * @param {array} points 其他坐标
   */
  async show(center = null, around = false, points = null) {
    const map = await this.getMap();
    this.showMap(center, around, points);
  }

  /**
   * 使用微信接口进行定位
   *
   * @param {string} type 坐标类型
   * @param {Function} success 成功执行
   * @param {Function} fail 失败执行
   * @param {Function} complete 完成后执行
   */
  // getLocWx(type, success, fail, complete) {
  //   (type = type || 'gcj02'), (success = success || function () {});
  //   fail = fail || function () {};
  //   complete = complete || function () {};
  //   wx.getLocation({
  //     type: type,
  //     success: success,
  //     fail: fail,
  //     complete: complete,
  //   });
  // }

  /**
   * 获取当前位置经纬度数组，百度坐标格式
   */
  async getLoc() {
    try {
      if (!navigator.geolocation) {
        alert(
          '该手机浏览器不支持地理定位，请升级浏览器或设置里面打开浏览器定位权限！'
        );
        return;
      }

      // let pm = new Promise((res, rej) => {
      //   navigator.geolocation.getCurrentPosition(res, rej, {
      //     enableHighAcuracy: true, // 指示浏览器获取高精度的位置，默认为false
      //     timeout: 5000, // 超时时间，默认不限时，单位为毫秒
      //     maximumAge: 10000, // 有效期，此参数指定缓存多久
      //   });
      // });
      // const pos = await pm().catch(e => {
      //   let msg = '';
      //   switch (e.code) {
      //     case e.PERMISSION_DENIED:
      //       msg = '用户不允许地理定位';
      //       break;
      //     case e.POSITION_UNAVAILABLE:
      //       msg = '无法获取当前位置';
      //       break;
      //     case e.TIMEOUT:
      //       msg = '操作超时';
      //       break;
      //     case er.UNKNOWN_ERROR:
      //       msg = '未知错误';
      //       break;
      //   }
      //   throw new Error(msg);
      // });
      // const {longitude: lon, latitude: lat} = pos.coords;
      const lng = 106.495419; // 106.574;
      const lat = 29.617266; // 29.5759;
      console.log('getLoc gps', {lng, lat});

      const map = await this.getMap();
      // 将HTML5定位获取的经纬度，转换成适应于百度定位的经纬度
      let p = new BMap.Point(lng, lat);
      const convertor = new BMap.Convertor();
      return new Promise((res, rej) => {
        convertor.translate([p], 1, 5, (data, status, msg) => {
          if (data.status)
            rej(new Error(`转换坐标出错 status:${status} msg:${msg}`));
          else {
            [p] = data.points;
            console.log('getLoc baidu', p);
            p = [p.lng, p.lat];
            this.emit('local::loc bmapLoc', p);
            res(p);
          }
        });
      });
    } catch (e) {
      console.error('getLoc exp.', {msg: e.message});
      alert(e.message);
    }
  }

  /**
   * 获得两点距离，失败返回 -1
   */
  async dist(p1, p2) {
    let R = -1;
    if (!p2) p2 = await this.getLoc();
    if (!p1 || !p2) return R;

    p1 = bpoint(p1);
    p2 = bpoint(p2);
    const map = await this.getMap();
    R = Math.round(map.getDistance(p1, p2));

    return R;
  }

  /**
   * 显示地图
   * @param {object} center 中心点，数组[经, 纬] or {lng: 经, lat: 维}
   * @param {Boolean} around 周边
   * @param {Array} points 其他坐标
   */
  async showMap(center = null, around = true, points = null) {
    // 转为为 Point 对象
    let point = center;
    if (!center) point = await this.getLoc();

    point = bpoint(point);

    // 初始化地图
    // 添加平移缩放控件
    if (this.opt.navigation) {
      this.map.addControl(
        // BMAP_NAVIGATION_CONTROL_LARGE 表示显示完整的平移缩放控件。
        // BMAP_NAVIGATION_CONTROL_SMALL 表示显示小型的平移缩放控件。
        // BMAP_NAVIGATION_CONTROL_PAN 表示只显示控件的平移部分功能。
        // BMAP_NAVIGATION_CONTROL_ZOOM 表示只显示控件的缩放部分功能。

        new BMap.NavigationControl({
          type: BMAP_NAVIGATION_CONTROL_SMALL,
          enableGeolocation: false, // 在浏览器或者安卓手机下精准定位
        })
      );
    }

    // 前提是使用https协议的网站
    // 定位到当前地址
    // var geolocation = new BMap.Geolocation();
    // geolocation.getCurrentPosition(
    //   function (r) {
    //     showLocationInMap(this.getStatus(), r);
    //   },
    //   {enableHighAccuracy: true}
    // );

    // this.map.addControl(new BMap.ScaleControl()); // 添加比例尺控件
    // this.map.addControl(new BMap.OverviewMapControl()); // 添加缩略地图控件
    // 仅当设置城市信息时，MapTypeControl的切换功能可用
    // map.addControl(new BMap.MapTypeControl()); // 地图类型控件，默认位于地图右上方。
    // map.setCurrentCity("重庆");

    this.map.clearOverlays();
    this.map.addOverlay(new BMap.Marker(point));
    // var label = new BMap.Label('转换后的百度坐标（正确）', {
    //   offset: new BMap.Size(20, -10),
    // });
    // marker.setLabel(label); //添加 label
    console.log('showMap center:%o', point);
    // 放大级别：16 级，默认 18 级
    // 防止地图偏移
    $.nextTick(() => this.map.centerAndZoom(point, 16));
    this.emit('local::show bmapShow', [point.lng, point.lat]);
    if (around) this.around(point);
  }

  /**
   * 调整地图中心，调用前，需确保地图已加载
   * @param {object} center 中心点，数组[经, 纬] or {lng: 经, lat: 维}
   */
  async center(center = null) {
    // 转为为 Point 对象
    if (!center) return;

    const point = bpoint(center);

    // 初始化地图
    // 添加平移缩放控件
    if (this.opt.navigation) {
      this.map.addControl(
        // BMAP_NAVIGATION_CONTROL_LARGE 表示显示完整的平移缩放控件。
        // BMAP_NAVIGATION_CONTROL_SMALL 表示显示小型的平移缩放控件。
        // BMAP_NAVIGATION_CONTROL_PAN 表示只显示控件的平移部分功能。
        // BMAP_NAVIGATION_CONTROL_ZOOM 表示只显示控件的缩放部分功能。

        new BMap.NavigationControl({
          type: BMAP_NAVIGATION_CONTROL_SMALL,
          enableGeolocation: false, // 在浏览器或者安卓手机下精准定位
        })
      );
    }

    this.map.clearOverlays();
    this.map.addOverlay(new BMap.Marker(point));
    // 放大级别：16 级，默认 18 级
    $.nextTick(() => this.map.centerAndZoom(point, 16));
    this.emit('local::center bmapCenter', [point.lng, point.lat]);
  }

  /**
   * 周边
   * @param {*} center
   */
  around(center) {
    const point = bpoint(center);
    const gc = new BMap.Geocoder();
    gc.getLocation(point, r => {
      console.log('around', {r});

      const title = r.address;
      const {address} = r;

      const {
        province,
        city,
        district,
        town,
        street,
        streetNumber,
      } = r.addressComponents;

      // 周边
      let ps = [];
      const surs = [];
      r.surroundingPois.forEach(p => {
        // const sur = surs.find(v => v.Ki === '房地产');
        // if (!sur) sur = srus[0];
        // if (sur)
        // addr = `${city}${district}${town}${street}${streetNumber}${sur.title}`;
        // title = `${sur.title} | ${sur.address}`;
        // 距离
        const dist = Math.round(
          this.map.getDistance(point, new BMap.Point(p.point.lng, p.point.lat))
        );

        surs.push({
          keyword: p.Ki,
          dist,
          title: p.title,
          address: p.address,
          province,
          city,
          district,
          town,
          street,
          streetNumber,
          point: [p.point.lng, p.point.lat],
          id: p.uid,
        });
      });

      if (surs.length) {
        ps = surs.sort((a, b) => a.dist - b.dist);
      }

      // 没有周边
      if (!ps.length) {
        // 距离
        const dist = Math.round(
          this.map.getDistance(point, new BMap.Point(r.point.lng, r.point.lat))
        );

        ps.push({
          keyword: '缺省',
          dist,
          title,
          address,
          province,
          city,
          district,
          town,
          street,
          streetNumber,
          point: [r.point.lng, r.point.lat],
          id: 0,
        });
      }

      console.log('around', {ps}); // 地址信息
      this.emit('local::around bmapAround', ps);
    });
  }

  /**
   * 将地址解析结果显示在地图上，并调整地图视野
   * @param {*} word 地址
   * @param {*} city 城市
   */
  getPoint(word, city) {
    const gc = new BMap.Geocoder();
    gc.getPoint(
      word,
      point => {
        if (point) {
          this.map.centerAndZoom(point, 16);
          this.map.addOverlay(new BMap.Marker(point));
        }
      },
      city
    );
  }

  onsearch(local, point, rs, res) {
    // 判断状态是否正确
    if (local.getStatus() === BMAP_STATUS_SUCCESS) {
      console.log('onsearch', {rs});
      const ps = [];
      rs.forEach(r => {
        // 每个关键字返回多页，第一次返回第一页内容
        // const pgcnt = r.getNumPages();
        // console.log('onsearch', {pgcnt});
        const {keyword} = r;

        for (let i = 0; i < r.getCurrentNumPois(); i++) {
          const q = r.getPoi(i);
          console.log('onsearch getPoi', {q});
          const {title, province, city, address, uid: id} = q;
          // 距离
          let dist = 0;
          if (point) dist = this.dist(point, q.point);

          ps.push({
            keyword,
            dist,
            title,
            province,
            city,
            address,
            point: [q.point.lng, q.point.lat],
            id,
          });
        }
      });
      if (point) ps.sort((a, b) => a.dist - b.dist);
      console.log('onsearch', {ps});

      res(ps);

      // var s = [];
      // for (var i = 0; i < rs.getCurrentNumPois(); i++) {
      //   s.push(rs.getPoi(i).title + ', ' + rs.getPoi(i).address);
      // }
      // document.getElementById('log').innerHTML = s.join('<br>');
    }
  }

  /**
   * 圆形周边搜索
   * @param {*} word 关键字
   * @param {*} center 中心点
   * @param {*} radius 半径，单位 米
   * @param {*} count 每个关键词，返回结果数量，缺省 10个
   */
  nearby(word, center, radius, count = 10) {
    const point = bpoint(center);
    return new Promise((res, rej) => {
      const local = new BMap.LocalSearch(this.map, {
        // renderOptions: {map: map, autoViewport: true},
        pageCapacity: count,
        onSearchComplete: rs => this.onsearch(local, point, rs, res),
      });
      local.searchNearby(word, point, radius);
      // const rs = local.getResults();
    });
  }

  /**
   * 圆形周边搜索
   * @param {*} word 关键字
   * @param {*} center 中心点
   * @param {*} radius 半径，单位 米
   * @param {*} count 每个关键词，返回结果数量，缺省 30个
   */
  search(word, center, count = 30) {
    const point = bpoint(center);
    return new Promise((res, rej) => {
      const local = new BMap.LocalSearch(this.map, {
        // renderOptions: {map: map, autoViewport: true},
        pageCapacity: count,
        onSearchComplete: rs => this.onsearch(local, point, rs, res),
      });
      local.search(word);
      // const rs = local.getResults();
    });
  }

  /**
   * POI周边检索
   *
   * @param {Object} param 检索配置
   * 参数对象结构可以参考
   * http://lbsyun.baidu.com/index.php?title=webapi/guide/webservice-placeapi
   */
  /*   search(param) {
    var that = this;
    param = param || {};
    let searchparam = {
      query: param['query'] || '生活服务$美食&酒店',
      scope: param['scope'] || 1,
      filter: param['filter'] || '',
      coord_type: param['coord_type'] || 2,
      page_size: param['page_size'] || 10,
      page_num: param['page_num'] || 0,
      output: param['output'] || 'json',
      ak: that.ak,
      sn: param['sn'] || '',
      timestamp: param['timestamp'] || '',
      radius: param['radius'] || 2000,
      ret_coordtype: 'gcj02ll',
    };
    let otherparam = {
      iconPath: param['iconPath'],
      iconTapPath: param['iconTapPath'],
      width: param['width'],
      height: param['height'],
      alpha: param['alpha'] || 1,
      success: param['success'] || function () {},
      fail: param['fail'] || function () {},
    };
    let type = 'gcj02';
    let locationsuccess = function (result) {
      searchparam['location'] = result['latitude'] + ',' + result['longitude'];
      wx.request({
        url: 'https://api.map.baidu.com/place/v2/search',
        data: searchparam,
        header: {
          'content-type': 'application/json',
        },
        method: 'GET',
        success(data) {
          let res = data['data'];
          if (res['status'] === 0) {
            let poiArr = res['results'];
            // outputRes 包含两个对象，
            // originalData为百度接口返回的原始数据
            // wxMarkerData为小程序规范的marker格式
            let outputRes = {};
            outputRes['originalData'] = res;
            outputRes['wxMarkerData'] = [];
            for (let i = 0; i < poiArr.length; i++) {
              outputRes['wxMarkerData'][i] = {
                id: i,
                latitude: poiArr[i]['location']['lat'],
                longitude: poiArr[i]['location']['lng'],
                title: poiArr[i]['name'],
                iconPath: otherparam['iconPath'],
                iconTapPath: otherparam['iconTapPath'],
                address: poiArr[i]['address'],
                telephone: poiArr[i]['telephone'],
                alpha: otherparam['alpha'],
                width: otherparam['width'],
                height: otherparam['height'],
              };
            }
            otherparam.success(outputRes);
          } else {
            otherparam.fail({
              errMsg: res['message'],
              statusCode: res['status'],
            });
          }
        },
        fail(data) {
          otherparam.fail(data);
        },
      });
    };
    let locationfail = function (result) {
      otherparam.fail(result);
    };
    let locationcomplete = function (result) {};
    if (!param['location']) {
      that.getWXLocation(type, locationsuccess, locationfail, locationcomplete);
    } else {
      let longitude = param.location.split(',')[1];
      let latitude = param.location.split(',')[0];
      let errMsg = 'input location';
      let res = {
        errMsg: errMsg,
        latitude: latitude,
        longitude: longitude,
      };
      locationsuccess(res);
    }
  }
 */
}

/**
 * 转换为百度Point 对象
 * @param {object} point 坐标
 */
function bpoint(point) {
  if (!point) return null;

  let R = point;
  if (!(point instanceof BMap.Point)) {
    if ($.isArray(point)) R = new BMap.Point(point[0], point[1]);
    else R = new BMap.Point(point.lng, point.lat);
  }

  return R;
}

// 两点之间的距离

// var pointA = new BMap.Point(data.points[0].lng,data.points[0].lat);//用户的经纬度
// var pointB = new BMap.Point(106.557308,29.615562);//从数据库中取出商家的经纬度
// alert('您到商家的距离是：'+(map.getDistance(pointA,pointB)).toFixed(2)+' 米。');  //获取两点距离,保留小数点后两位

// 地图展示当前位置
/* var accuracy = '';
var longitude = '';
var latitude = '';
function showLocationInMap(status, r) {
  if (status == BMAP_STATUS_SUCCESS) {
    //检索成功。对应数值“0”。
    var mk = new BMap.Marker(r.point);
    map.addOverlay(mk);
    map.panTo(r.point);

    //console.log(r.accuracy);
    //console.log(r.point.lng);
    //console.log(r.point.lat);
    accuracy = r.accuracy;
    longitude = r.point.lng;
    latitude = r.point.lat;

    //用所定位的经纬度查找所在地省市街道等信息
    var point = new BMap.Point(r.point.lng, r.point.lat);
    var gc = new BMap.Geocoder();
    gc.getLocation(point, function (rs) {
      var addComp = rs.addressComponents;
      //console.log(rs.address);//地址信息
      actual_address = rs.address;
      var address = new BMap.Label(rs.address, {
        offset: new BMap.Size(-80, -25),
      });
      mk.setLabel(address); //添加地址标注
    });
  } else if (status == BMAP_STATUS_CITY_LIST) {
    //城市列表。对应数值“1”。
    common.alertMsg('城市列表', 0);
  } else if (status == BMAP_STATUS_UNKNOWN_LOCATION) {
    //位置结果未知。对应数值“2”。
    common.alertMsg('位置结果未知', 0);
  } else if (status == BMAP_STATUS_UNKNOWN_ROUTE) {
    //导航结果未知。对应数值“3”。
    common.alertMsg('导航结果未知', 0);
  } else if (status == BMAP_STATUS_INVALID_KEY) {
    //非法密钥。对应数值“4”。
    common.alertMsg('非法密钥', 0);
  } else if (status == BMAP_STATUS_INVALID_REQUEST) {
    //非法请求。对应数值“5”。
    common.alertMsg('非法请求', 0);
  } else if (status == BMAP_STATUS_PERMISSION_DENIED) {
    //没有权限。对应数值“6”。(自 1.1 新增)
    common.alertMsg('没有权限', 0);
  } else if (status == BMAP_STATUS_SERVICE_UNAVAILABLE) {
    //服务不可用。对应数值“7”。(自 1.1 新增)
    common.alertMsg('服务不可用', 0);
  } else if (status == BMAP_STATUS_TIMEOUT) {
    //超时。对应数值“8”。(自 1.1 新增)
    common.alertMsg('超时', 0);
  } else {
    common.alertMsg('未知错误', 0);
  }
}
 */
