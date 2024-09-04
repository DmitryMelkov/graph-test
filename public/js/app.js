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
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'проценты',
        },
      },
    },
  },
});

const fetchCpuUsage = async () => {
  try {
    const response = await fetch('http://169.254.7.86:3000/api/cpu-usage');
    const data = await response.json();

    // Обновите метки и данные графика
    cpuUsageData.labels = data.map((entry) => new Date(entry.timestamp).toLocaleTimeString());
    cpuUsageData.datasets[0].data = data.map((entry) => entry.value);

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
