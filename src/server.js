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
  value1: Number,
  value2: Number,
  value3: Number,
  value4: Number,
  timestamp: { type: Date, default: Date.now },
});


const CpuUsage = mongoose.model('CpuUsage', cpuUsageSchema);

// Middleware
app.use(cors()); // Разрешает CORS, чтобы ваш клиент мог обращаться к серверу

// Функция для получения данных
const fetchCpuUsage = async () => {
  try {
    const response = await axios.get('http://169.254.6.19/kaskad/Web_Clnt.dll/ShowPage?public/example.html');
    const regexPattern = /<span class="value(\d)">\s*([\d,]+)\s*<\/span>/g;
    const matches = [...response.data.matchAll(regexPattern)];

    if (matches.length === 4) {
      const values = matches.map(match => parseFloat(match[2].replace(',', '.')));
      const [value1, value2, value3, value4] = values;
      
      const cpuUsage = new CpuUsage({ value1, value2, value3, value4 });
      await cpuUsage.save();
      console.log('Сохранено в MongoDB:', { value1, value2, value3, value4 });
    } else {
      console.error('Не удалось найти все значения загрузки процессора в ответе.');
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
