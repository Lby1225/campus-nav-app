document.addEventListener('DOMContentLoaded', function() {
  // ---------- 1. 地图初始化 ----------
  var map = L.map('map').setView([55.787778, 37.608056], 16);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);


  // ---------- 2. 定义10栋教学楼的信息（含名称+经纬度） ----------
  var teachingBuildings = [
    {
      name: "第一教学楼",
      lat: 55.7885,
      lng: 37.6092,
      info: "主要课程：交通运输工程、铁路信号<br>楼层：6层（含实验室2个）"
    },
    {
      name: "第二教学楼",
      lat: 55.7882,
      lng: 37.6085,
      info: "主要课程：机械工程、车辆工程<br>楼层：5层（含实训车间）"
    },
    {
      name: "第三教学楼",
      lat: 55.7890,
      lng: 37.6070,
      info: "主要课程：计算机科学、人工智能<br>楼层：7层（含计算机实验室）"
    },
    {
      name: "第四教学楼",
      lat: 55.7870,
      lng: 37.6065,
      info: "主要课程：土木工程、桥梁工程<br>楼层：6层（含结构力学实验室）"
    },
    {
      name: "第五教学楼",
      lat: 55.7875,
      lng: 37.6088,
      info: "主要课程：经济学、管理学<br>楼层：4层（含多媒体教室）"
    },
    {
      name: "第六教学楼",
      lat: 55.7868,
      lng: 37.6078,
      info: "主要课程：外语、人文社科<br>楼层：5层（含语音室）"
    },
    {
      name: "第七教学楼",
      lat: 55.7895,
      lng: 37.6082,
      info: "主要课程：自动化、电气工程<br>楼层：6层（含电气实验室）"
    },
    {
      name: "第八教学楼",
      lat: 55.7888,
      lng: 37.6098,
      info: "主要课程：物流管理、供应链<br>楼层：5层（含模拟物流中心）"
    },
    {
      name: "第九教学楼",
      lat: 55.7865,
      lng: 37.6100,
      info: "主要课程：环境工程、安全工程<br>楼层：4层（含环保实验室）"
    },
    {
      name: "第十教学楼",
      lat: 55.7872,
      lng: 37.6105,
      info: "主要课程：研究生课程、学术研讨<br>楼层：7层（含研讨室5个）"
    }
  ];


  // ---------- 3. 给每栋教学楼添加标记 ----------
  var buildingMarkers = []; // 存储所有教学楼标记，方便后续搜索
  teachingBuildings.forEach(building => {
    var marker = L.marker([building.lat, building.lng])
      .addTo(map)
      .bindPopup(`
        <div style="text-align:center">
          <strong>${building.name}</strong><br>
          ${building.info}
        </div>
      `);
    buildingMarkers.push({
      name: building.name,
      marker: marker
    });
  });


  // ---------- 4. 搜索功能：给搜索框和按钮添加事件 ----------
  var searchInput = document.querySelector('.sidebar input');
  var searchBtn = document.querySelector('.sidebar button');

  // 搜索框按回车触发搜索
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      searchBuilding();
    }
  });
  // 搜索按钮点击触发搜索
  searchBtn.addEventListener('click', searchBuilding);

  function searchBuilding() {
    var searchText = searchInput.value.trim();
    if (!searchText) return; // 空输入不处理

    // 查找匹配的教学楼
    var matchedBuilding = teachingBuildings.find(building => 
      building.name.includes(searchText)
    );
    if (matchedBuilding) {
      // 移动地图到该教学楼位置，并打开弹窗
      map.setView([matchedBuilding.lat, matchedBuilding.lng], 17); // 放大地图
      var matchedMarker = buildingMarkers.find(marker => 
        marker.name === matchedBuilding.name
      ).marker;
      matchedMarker.openPopup();
    } else {
      alert('未找到该地点，请检查输入～');
    }
  }


  // ---------- 5. 路径规划功能（修复显示问题） ----------
  // 确保Leaflet Routing Machine插件已正确引入（之前的HTML步骤要做对）
  // ---------- 5. 路径规划功能（修复显示问题） ----------
// 确保Leaflet Routing Machine插件已正确引入（之前的HTML步骤要做对）
var routingControl = L.Routing.control({
  waypoints: [
    L.latLng(55.787778, 37.608056), // 学校中心（起点）
    L.latLng(55.7885, 37.60692)     // 第一教学楼（默认终点）
  ],
  routeWhileDragging: true,
  showAlternatives: false,
  collapsible: true,
  addWaypoints: false,
  routeTolerance: 50
}).addTo(map);

// 点击教学楼标记，切换路径终点
buildingMarkers.forEach(item => {
  item.marker.on('click', function(e) {
    routingControl.setWaypoints([
      routingControl.getWaypoints()[0], // 保持起点
      e.latlng // 点击的位置作为新终点
    ]);
  });
});

  // 点击教学楼标记，切换路径终点
  buildingMarkers.forEach(item => {
    item.marker.on('click', function(e) {
      routingControl.setWaypoints([
        routingControl.getWaypoints()[0], // 保持起点
        e.latlng // 点击的位置作为新终点
      ]);
    });
  });
});

document.addEventListener('DOMContentLoaded', function() {
  // 第一步：获取用户实时位置
  navigator.geolocation.getCurrentPosition(
    // 定位成功回调
    function(position) {
      const userLat = position.coords.latitude;   // 用户纬度
      const userLng = position.coords.longitude;  // 用户经度
      const userAccuracy = position.coords.accuracy; // 定位精度（米）

      // 初始化地图，以用户位置为中心
      var map = L.map('map').setView([userLat, userLng], 17); // 缩放级别17，更聚焦

      // 加载地图瓦片
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // 添加用户位置标记
      L.marker([userLat, userLng])
        .bindPopup(`你的位置（精度：${userAccuracy}米）`)
        .addTo(map);

      // 第二步：设置路径规划（以用户位置为起点，目的地还是第一教学楼为例）
      var routingControl = L.Routing.control({
        waypoints: [
          L.latLng(userLat, userLng), // 起点：用户实时位置
          L.latLng(55.7882, 37.8048)  // 终点：第一教学楼（可换成你要去的地点）
        ],
        routeWhileDragging: true, // 拖动地图时自动更新路径
        collapsible: true        // 路径面板可折叠
      }).addTo(map);

      // 处理“重新定位”按钮（可选，用户移动后可点击更新位置）
      document.getElementById('locate-me').addEventListener('click', function() {
        navigator.geolocation.getCurrentPosition(
          function(newPos) {
            map.setView([newPos.coords.latitude, newPos.coords.longitude], 17);
            routingControl.setWaypoints([
              L.latLng(newPos.coords.latitude, newPos.coords.longitude),
              routingControl.getWaypoints()[1] // 保持原终点
            ]);
          },
          function(err) {
            alert('定位失败：' + err.message);
          }
        );
      });
    },
    // 定位失败回调
    function(error) {
      alert('获取位置失败：' + error.message + '，请手动选择起点');
      //  fallback：如果定位失败，就用原来的“学校中心”作为起点
      var map = L.map('map').setView([39.9042, 116.4074], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy;  contributors'
      }).addTo(map);
    }
  );
});