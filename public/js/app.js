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
          tooltipFormat: 'DD/MM/YYYY HH:mm',
          displayFormats: {
            minute: 'HH:mm',
          },
        },
      },
    },
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: 'xy', // Позволяет панорамирование по обеим осям
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          mode: 'xy', // Позволяет масштабирование по обеим осям
        },
      },
    },
  },
});

const fetchCpuUsage = async () => {
  try {
    const response = await fetch('http://169.254.7.86:3000/api/cpu-usage');
    const data = await response.json();

    // Фильтруем данные для последних 30 минут
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60000);

    const filteredData = data.filter((entry) => new Date(entry.timestamp) >= thirtyMinutesAgo);

    // Обновите метки и данные графика
    cpuUsageData.labels = filteredData.map((entry) => moment(entry.timestamp));
    cpuUsageData.datasets[0].data = filteredData.map((entry) => entry.value);

    // Обновляем график
    cpuUsageChart.update();
  } catch (error) {
    console.error('Ошибка при получении данных:', error);
  }
};

// Получаем данные каждые 10 секунд
setInterval(fetchCpuUsage, 10000);
// Первоначально загружаем данные
fetchCpuUsage();
