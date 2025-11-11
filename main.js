document.addEventListener('DOMContentLoaded', function() {
  // ---------- 1. 定义10栋教学楼的信息（复用你的数据） ----------
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


  // ---------- 2. 初始化地图（统一入口，避免重复） ----------
  let map; // 全局地图实例
  let routingControl; // 全局路径规划实例
  let buildingMarkers = []; // 存储教学楼标记


  // ---------- 3. 获取用户位置并初始化地图 ----------
  function initMap(startLat, startLng) {
    // 创建地图实例（以起点为中心）
    map = L.map('map').setView([startLat, startLng], 17);

    // 加载地图瓦片（OpenStreetMap）
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // 添加起点标记（用户位置或默认位置）
    L.marker([startLat, startLng])
      .bindPopup(`起点位置`)
      .addTo(map);

    // 添加所有教学楼标记
    teachingBuildings.forEach(building => {
      const marker = L.marker([building.lat, building.lng])
        .addTo(map)
        .bindPopup(`
          <div style="text-align:center">
            <strong>${building.name}</strong><br>
            ${building.info}
          </div>
        `);
      buildingMarkers.push({ name: building.name, marker: marker });
    });

    // 初始化路径规划（默认终点：第一教学楼）
    routingControl = L.Routing.control({
      waypoints: [
        L.latLng(startLat, startLng), // 起点
        L.latLng(teachingBuildings[0].lat, teachingBuildings[0].lng) // 第一教学楼
      ],
      routeWhileDragging: true,
      showAlternatives: false,
      collapsible: true,
      addWaypoints: false,
      routeTolerance: 50
    }).addTo(map);

    // 点击教学楼标记切换终点
    buildingMarkers.forEach(item => {
      item.marker.on('click', function(e) {
        routingControl.setWaypoints([
          routingControl.getWaypoints()[0], // 保持起点
          e.latlng // 点击位置作为新终点
        ]);
      });
    });

    // 绑定搜索功能
    bindSearchFunction();
  }


  // ---------- 4. 搜索功能实现 ----------
  function bindSearchFunction() {
    const searchInput = document.querySelector('.sidebar input');
    const searchBtn = document.querySelector('.sidebar button:nth-of-type(1)'); // 第一个按钮是搜索

    // 回车搜索
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') searchBuilding();
    });
    // 点击搜索
    searchBtn.addEventListener('click', searchBuilding);

    function searchBuilding() {
      const searchText = searchInput.value.trim();
      if (!searchText) return;

      const matched = teachingBuildings.find(b => b.name.includes(searchText));
      if (matched) {
        map.setView([matched.lat, matched.lng], 17); // 移动到目标位置
        const marker = buildingMarkers.find(m => m.name === matched.name).marker;
        marker.openPopup(); // 打开弹窗
      } else {
        alert('未找到该地点，请检查输入～');
      }
    }
  }


  // ---------- 5. 重新定位功能 ----------
  document.getElementById('locate-me').addEventListener('click', function() {
    navigator.geolocation.getCurrentPosition(
      (newPos) => {
        const newLat = newPos.coords.latitude;
        const newLng = newPos.coords.longitude;
        map.setView([newLat, newLng], 17); // 移动地图到新位置
        // 更新路径起点
        routingControl.setWaypoints([
          L.latLng(newLat, newLng),
          routingControl.getWaypoints()[1] // 保持原终点
        ]);
      },
      (err) => {
        alert('重新定位失败：' + err.message);
      }
    );
  });


  // ---------- 6. 启动逻辑：先获取用户位置，失败则用默认位置 ----------
  navigator.geolocation.getCurrentPosition(
    // 定位成功：用用户位置初始化
    (position) => {
      initMap(position.coords.latitude, position.coords.longitude);
    },
    // 定位失败：用默认位置（学校中心）初始化
    (error) => {
      alert('获取位置失败：' + error.message + '，将使用默认位置');
      initMap(55.787778, 37.608056); // 你的默认学校中心
    }
  );
});