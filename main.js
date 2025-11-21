document.addEventListener('DOMContentLoaded', function() {
  // ---------- 1. 教学楼信息（含楼名、经纬度、课程、楼层数） ----------
  var teachingBuildings = [
    {
      name: "第一教学楼",
      lat: 55.7885,
      lng: 37.6092,
      info: "主要课程：交通运输工程、铁路信号",
      floor: 6
    },
    {
      name: "第二教学楼",
      lat: 55.7882,
      lng: 37.6085,
      info: "主要课程：机械工程、车辆工程",
      floor: 5
    },
    {
      name: "第三教学楼",
      lat: 55.7890,
      lng: 37.6070,
      info: "主要课程：计算机科学、人工智能",
      floor: 7
    },
    {
      name: "第四教学楼",
      lat: 55.7870,
      lng: 37.6065,
      info: "主要课程：土木工程、桥梁工程",
      floor: 6
    },
    {
      name: "第五教学楼",
      lat: 55.7875,
      lng: 37.6088,
      info: "主要课程：经济学、管理学",
      floor: 4
    },
    {
      name: "第六教学楼",
      lat: 55.7868,
      lng: 37.6078,
      info: "主要课程：外语、人文社科",
      floor: 5
    },
    {
      name: "第七教学楼",
      lat: 55.7895,
      lng: 37.6082,
      info: "主要课程：自动化、电气工程",
      floor: 6
    },
    {
      name: "第八教学楼",
      lat: 55.7888,
      lng: 37.6098,
      info: "主要课程：物流管理、供应链",
      floor: 5
    },
    {
      name: "第九教学楼",
      lat: 55.7865,
      lng: 37.6100,
      info: "主要课程：环境工程、安全工程",
      floor: 4
    },
    {
      name: "第十教学楼",
      lat: 55.7872,
      lng: 37.6105,
      info: "主要课程：研究生课程、学术研讨",
      floor: 7
    }
  ];


  // ---------- 2. 全局变量 ----------
  let map; // 地图实例
  let routingControl; // 路径规划实例
  let buildingMarkers = []; // 教学楼标记


  // ---------- 3. 初始化地图 ----------
  function initMap(startLat, startLng) {
    // 创建地图
    map = L.map('map').setView([startLat, startLng], 17);

    // 加载地图瓦片
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // 起点标记
    L.marker([startLat, startLng])
      .bindPopup(`起点位置`)
      .addTo(map);

    // 添加教学楼标记+透明菱形楼层
    teachingBuildings.forEach((building, buildingIndex) => {
      // 动态生成楼层菱形
      let floorPlanes = '';
      for (let i = 1; i <= building.floor; i++) {
        floorPlanes += `<div class="floor-plane" data-building="${buildingIndex + 1}" data-floor="${i}">${i}层</div>`;
      }

      // 标记+弹窗
      const marker = L.marker([building.lat, building.lng])
        .addTo(map)
        .bindPopup(`
          <div class="building-popup">
            <h3>${building.name}</h3>
            <p>${building.info}</p >
            <div class="floor-group">
              ${floorPlanes}
            </div>
          </div>
        `);
      buildingMarkers.push({ name: building.name, marker: marker });
    });

    // 初始化路径规划
    routingControl = L.Routing.control({
      waypoints: [
        L.latLng(startLat, startLng),
        L.latLng(teachingBuildings[0].lat, teachingBuildings[0].lng)
      ],
      routeWhileDragging: true,
      collapsible: true
    }).addTo(map);

    // 点击标记切换路径终点
    buildingMarkers.forEach(item => {
      item.marker.on('click', function(e) {
        routingControl.setWaypoints([
          routingControl.getWaypoints()[0],
          e.latlng
        ]);
      });
    });

    // 绑定搜索功能
    bindSearchFunction();
  }


  // ---------- 4. 搜索功能 ----------
  function bindSearchFunction() {
    const searchInput = document.querySelector('.sidebar input');
    const searchBtn = document.querySelector('.sidebar button:nth-of-type(1)');

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
        map.setView([matched.lat, matched.lng], 17);
        const marker = buildingMarkers.find(m => m.name === matched.name).marker;
        marker.openPopup();
      } else {
        alert('未找到该地点～');
      }
    }
  }


  // ---------- 5. 重新定位功能 ----------
  document.getElementById('locate-me').addEventListener('click', function() {
    navigator.geolocation.getCurrentPosition(
      (newPos) => {
        map.setView([newPos.coords.latitude, newPos.coords.longitude], 17);
        routingControl.setWaypoints([
          L.latLng(newPos.coords.latitude, newPos.coords.longitude),
          routingControl.getWaypoints()[1]
        ]);
      },
      (err) => {
        alert('重新定位失败：' + err.message);
      }
    );
  });


  // ---------- 6. 点击楼层显示布局图（边缘+手柄双拖拽缩放） ----------
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('floor-plane')) {
    const buildingNum = e.target.dataset.building;
    const floorNum = e.target.dataset.floor;
    const buildingName = teachingBuildings[buildingNum - 1].name;

    // 布局图路径
    const layoutImgPath = `/campus-nav-app/floor-layouts/building${buildingNum}-floor${floorNum}.jpg`;

    // 创建/获取布局图面板
    let layoutPanel = document.querySelector('.floor-layout-panel');
    if (!layoutPanel) {
      layoutPanel = document.createElement('div');
      layoutPanel.className = 'floor-layout-panel';
      document.body.appendChild(layoutPanel);

      // 添加缩放手柄
      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'resize-handle';
      layoutPanel.appendChild(resizeHandle);

      // 缩放相关变量
      let isResizing = false;
      let resizeType = ''; // 缩放类型：right/bottom/corner
      let startX, startY, startWidth, startHeight;

      // 1. 监听鼠标在面板上的位置，切换光标样式
      layoutPanel.addEventListener('mousemove', function(e) {
        const rect = layoutPanel.getBoundingClientRect();
        // 边缘检测范围（10px内）
        const isRightEdge = e.clientX >= rect.right - 10 && e.clientX <= rect.right;
        const isBottomEdge = e.clientY >= rect.bottom - 10 && e.clientY <= rect.bottom;

        // 根据位置切换光标和缩放类型
        if (isRightEdge && isBottomEdge) {
          layoutPanel.className = 'floor-layout-panel resizable-corner';
          resizeType = 'corner';
        } else if (isRightEdge) {
          layoutPanel.className = 'floor-layout-panel resizable-right';
          resizeType = 'right';
        } else if (isBottomEdge) {
          layoutPanel.className = 'floor-layout-panel resizable-bottom';
          resizeType = 'bottom';
        } else {
          layoutPanel.className = 'floor-layout-panel';
          resizeType = '';
        }
      });

      // 2. 鼠标按下：开始缩放
      layoutPanel.addEventListener('mousedown', function(e) {
        // 只有在边缘/手柄区域才触发缩放
        if (resizeType || e.target.classList.contains('resize-handle')) {
          isResizing = true;
          // 记录初始状态
          startX = e.clientX;
          startY = e.clientY;
          startWidth = parseInt(window.getComputedStyle(layoutPanel).width);
          startHeight = parseInt(window.getComputedStyle(layoutPanel).height);
          // 强制设置为右下缩放（如果点的是手柄）
          if (e.target.classList.contains('resize-handle')) {
            resizeType = 'corner';
          }
          e.preventDefault(); // 阻止文字选中
        }
      });

      // 3. 鼠标移动：更新尺寸
      document.addEventListener('mousemove', function(e) {
        if (!isResizing) return;

        // 根据缩放类型计算新尺寸
        let newWidth = startWidth;
        let newHeight = startHeight;
        if (resizeType === 'right' || resizeType === 'corner') {
          newWidth = startWidth + (e.clientX - startX);
        }
        if (resizeType === 'bottom' || resizeType === 'corner') {
          newHeight = startHeight + (e.clientY - startY);
        }

        // 限制最小尺寸
        if (newWidth >= 300) layoutPanel.style.width = `${newWidth}px`;
        if (newHeight >= 200) layoutPanel.style.height = `${newHeight}px`;
      });

      // 4. 鼠标松开：结束缩放
      document.addEventListener('mouseup', function() {
        isResizing = false;
      });
    }

      // 渲染布局图内容
      layoutPanel.innerHTML = `
       <!-- 加一行：标题+重置按钮的容器 -->
       <div style="display:flex;justify-content:space-between;align-items:center;">
        <h4>${buildingName} ${floorNum}层布局图</h4>
        <button class="reset-size-btn" style="padding:2px 8px;font-size:12px;">重置尺寸</button>
       </div>
       <img src="${layoutImgPath}" class="floor-layout-img" alt="${buildingName}${floorNum}层布局图" style="width:100%;max-height:100%;object-fit:contain;">
       <button class="close-layout-btn">关闭布局图</button>
      `;

    // 重新添加缩放手柄
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    layoutPanel.appendChild(resizeHandle);

    // 显示面板
    layoutPanel.style.display = 'block';

    // 关闭按钮（你已有的代码）
document.querySelector('.close-layout-btn').addEventListener('click', function() {
  layoutPanel.style.display = 'none';
});

// 新增：重置尺寸按钮的事件
document.querySelector('.reset-size-btn').addEventListener('click', function() {
  layoutPanel.style.width = '350px'; // 回到初始宽度
  layoutPanel.style.height = '400px';// 回到初始高度
});

}
});


  // ---------- 7. 启动逻辑 ----------
  navigator.geolocation.getCurrentPosition(
    (position) => {
      initMap(position.coords.latitude, position.coords.longitude);
    },
    (error) => {
      alert('获取位置失败：' + error.message + '，将使用默认位置');
      initMap(55.787778, 37.608056); // 默认学校中心
    }
  );
});