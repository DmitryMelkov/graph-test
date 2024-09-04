import express from 'express';
import mongoose from 'mongoose';
import axios from 'axios';
import cors from 'cors'; // Импортируйте cors

const app = express();
const PORT = 3000; // Выберите любой доступный порт

// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/your_database');

// Создание схемы и модели для хранения данных
const cpuUsageSchema = new mongoose.Schema({
  value: Number,
  timestamp: { type: Date, default: Date.now },
});

const CpuUsage = mongoose.model('CpuUsage', cpuUsageSchema);

// Middleware
app.use(cors()); // Разрешает CORS, чтобы ваш клиент мог обращаться к серверу

// Функция для получения данных
const fetchCpuUsage = async () => {
  try {
    const response = await axios.get('http://169.254.7.86/kaskad/Web_Clnt.dll/ShowPage?public/example.html');
    const match = response.data.match(/<span class="content__value">\s*([\d,]+)\s*<\/span>/);

    if (match && match[1]) {
      const cpuValue = parseFloat(match[1].replace(',', '.'));
      const cpuUsage = new CpuUsage({ value: cpuValue });
      await cpuUsage.save();
      console.log('Сохранено в MongoDB:', cpuValue);
    } else {
      console.error('Не удалось найти значение загрузки процессора в ответе.');
    }
  } catch (error) {
    console.error('Ошибка при получении данных:', error);
  }
};

// Запуск функции fetchCpuUsage каждые 10 секунд
setInterval(fetchCpuUsage, 10000);

// Новый маршрут для получения данных
app.get('/api/cpu-usage', async (req, res) => {
  try {
    const data = await CpuUsage.find().sort({ timestamp: 1 }); // Сортировка по времени
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения данных' });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
