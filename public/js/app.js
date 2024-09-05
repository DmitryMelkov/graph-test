const ctx = document.getElementById('cpuUsageChart').getContext('2d');
let cpuUsageData = {
  labels: [],
  datasets: [
    {
      label: 'Загрузка CPU (%)',
      data: [],
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderWidth: 1,
    },
  ],
};

const cpuUsageChart = new Chart(ctx, {
  type: 'line',
  data: cpuUsageData,
  options: {
    scales: {
      y: { beginAtZero: true },
      x: {
        type: 'time',
        time: {
          unit: 'minute',
          stepSize: 5,
          tooltipFormat: 'DD/MM/YYYY HH:mm',
          displayFormats: {
            minute: 'HH:mm',
          },
          min: null,
          max: null,
        },
        ticks: {
          maxTicksLimit: 10,
        },
      },
    },
    plugins: {
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
  },
});

const fetchCpuUsage = async () => {
  try {
    const response = await fetch('http://169.254.7.86:3000/api/cpu-usage');
    const data = await response.json();

    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60000);

    cpuUsageData.labels = data.map((entry) => moment(entry.timestamp));
    cpuUsageData.datasets[0].data = data.map((entry) => entry.value);

    cpuUsageChart.options.scales.x.min = thirtyMinutesAgo;
    cpuUsageChart.options.scales.x.max = now;

    cpuUsageChart.options.plugins.zoom.zoom.rangeMin.x = oneDayAgo;
    cpuUsageChart.options.plugins.zoom.zoom.rangeMax.x = now;

    cpuUsageChart.update();
  } catch (error) {
    console.error('Ошибка при получении данных:', error);
  }
};

setInterval(fetchCpuUsage, 10000);
fetchCpuUsage();

document.getElementById('prevBtn').addEventListener('click', () => {
  const step = 30 * 60000;

  const min = new Date(cpuUsageChart.options.scales.x.min);
  const max = new Date(cpuUsageChart.options.scales.x.max);

  cpuUsageChart.options.scales.x.min = new Date(min.getTime() - step);
  cpuUsageChart.options.scales.x.max = new Date(max.getTime() - step);

  cpuUsageChart.update();
});

document.getElementById('nextBtn').addEventListener('click', () => {
  const step = 30 * 60000;

  const min = new Date(cpuUsageChart.options.scales.x.min);
  const max = new Date(cpuUsageChart.options.scales.x.max);

  cpuUsageChart.options.scales.x.min = new Date(min.getTime() + step);
  cpuUsageChart.options.scales.x.max = new Date(max.getTime() + step);

  cpuUsageChart.update();
});
