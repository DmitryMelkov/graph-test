const ctx = document.getElementById('cpuUsageChart').getContext('2d');
let userNavigated = false;
let cpuUsageData = {
  labels: [], // Метки времени
  datasets: [
    {
      label: 'Загрузка CPU (value1) (%)',
      data: [],
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderWidth: 1,
      pointRadius: 0
    },
    {
      label: 'Загрузка CPU (value2) (%)',
      data: [],
      borderColor: 'rgba(192, 75, 192, 1)',
      backgroundColor: 'rgba(192, 75, 192, 0.2)',
      borderWidth: 1,
      pointRadius: 0
    },
    {
      label: 'Загрузка CPU (value3) (%)',
      data: [],
      borderColor: 'rgba(192, 192, 75, 1)',
      backgroundColor: 'rgba(192, 192, 75, 0.2)',
      borderWidth: 1,
      pointRadius: 0
    },
    {
      label: 'Загрузка CPU (value4) (%)',
      data: [],
      borderColor: 'rgba(75, 75, 192, 1)',
      backgroundColor: 'rgba(75, 75, 192, 0.2)',
      borderWidth: 1,
      pointRadius: 0
    },
  ],
};

// Вертикальная линия при наводе мышкой
const verticalLinePlugin = {
  id: 'verticalLine',
  afterDatasetsDraw(chart) {
    if (chart.tooltip._active && chart.tooltip._active.length) {
      const ctx = chart.ctx;
      const activePoint = chart.tooltip._active[0];
      const x = activePoint.element.x;
      const topY = chart.scales.y.top;
      const bottomY = chart.scales.y.bottom;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, topY);
      ctx.lineTo(x, bottomY);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.stroke();
      ctx.restore();
    }
  }
};

const cpuUsageChart = new Chart(ctx, {
  type: 'line',
  data: cpuUsageData,
  options: {
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        max: 50,
        position: 'left',
      },
      y1: {
        beginAtZero: true,
        min: 0,
        max: 50,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        type: 'time',
        time: {
          unit: 'minute',
          stepSize: 5,
          tooltipFormat: 'DD.MM.YY HH:mm',
          displayFormats: {
            minute: 'DD.MM.YY HH:mm',
          },
          min: null,
          max: null,
        },
        ticks: {
          maxTicksLimit: 10,
        },
        offset: true,
      },
    },
    plugins: {
      tooltip: {
        mode: 'index',
        intersect: false,
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          mode: 'x',
          rangeMin: {
            x: null,
          },
          rangeMax: {
            x: null,
          },
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart', 
    },
  },
  plugins: [verticalLinePlugin],  // включение вертикальной линии
});

cpuUsageData.datasets.forEach(dataset => {
  dataset.tension = 0.4;
});

const fetchCpuUsage = async () => {
  try {
    const response = await fetch('http://169.254.6.19:3000/api/cpu-usage');
    const data = await response.json();

    const now = new Date();
    const thirtyMinutesAgo = new Date(now - 60 * 60000);
    const oneDayAgo = new Date(now - 24 * 60 * 60000);

    const labels = data.map(entry => moment(entry.timestamp));
    const datasetsData = [0, 1, 2, 3].map(i => data.map(entry => entry[`value${i + 1}`]));

    cpuUsageData.labels = labels;
    cpuUsageData.datasets.forEach((dataset, index) => {
      dataset.data = datasetsData[index];
    });

    if (!userNavigated) {
      Object.assign(cpuUsageChart.options.scales.x, {
        min: thirtyMinutesAgo,
        max: now
      });
    }

    Object.assign(cpuUsageChart.options.plugins.zoom.zoom.rangeMin, { x: oneDayAgo });
    Object.assign(cpuUsageChart.options.plugins.zoom.zoom.rangeMax, { x: now });

    cpuUsageChart.update();
  } catch (error) {
    console.error('Ошибка при получении данных:', error);
  }
};

// Обработчики событий
document.getElementById('prevBtn').addEventListener('click', () => {
  userNavigated = true;
  const step = 30 * 60000;

  const min = new Date(cpuUsageChart.options.scales.x.min);
  const max = new Date(cpuUsageChart.options.scales.x.max);

  cpuUsageChart.options.scales.x.min = new Date(min.getTime() - step);
  cpuUsageChart.options.scales.x.max = new Date(max.getTime() - step);

  cpuUsageChart.update();
});

document.getElementById('nextBtn').addEventListener('click', () => {
  userNavigated = true;
  const step = 30 * 60000;

  const min = new Date(cpuUsageChart.options.scales.x.min);
  const max = new Date(cpuUsageChart.options.scales.x.max);

  cpuUsageChart.options.scales.x.min = new Date(min.getTime() + step);
  cpuUsageChart.options.scales.x.max = new Date(max.getTime() + step);

  cpuUsageChart.update();
});

document.getElementById('resetBtn').addEventListener('click', () => {
  userNavigated = false;
  const now = new Date();
  const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60000);

  cpuUsageChart.options.scales.x.min = thirtyMinutesAgo;
  cpuUsageChart.options.scales.x.max = now;

  cpuUsageChart.update();
});

setInterval(fetchCpuUsage, 10000);
fetchCpuUsage();
