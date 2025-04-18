const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// MongoDB bağlantısı için yardımcı fonksiyon
const connectMongoDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ayni-anda';
  
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI);
      console.log('Connected to MongoDB');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// Activity modeli
const ActivitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  count: {
    type: Number,
    default: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Mongoose model oluştur veya varsa kullan
const ActivityModel = mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server);

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Aktivite başlatıldığında
    socket.on('startActivity', async (name) => {
      console.log('Activity started:', name);
      
      try {
        await connectMongoDB();
        
        // Aktiviteyi bul veya oluştur
        let activity = await ActivityModel.findOne({ name });
        
        if (activity) {
          // Sayıyı artır
          activity.count += 1;
          activity.updatedAt = new Date();
          await activity.save();
        } else {
          // Count=0 olan aktiviteyi kontrol et
          activity = await ActivityModel.findOne({ name, count: 0 });
          
          if (activity) {
            activity.count = 1;
            activity.updatedAt = new Date();
            await activity.save();
          } else {
            // Yeni aktivite oluştur
            activity = await ActivityModel.create({
              name,
              count: 1,
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
        }
        
        // Tüm etkin aktiviteleri al
        const activeActivities = await ActivityModel.find({ count: { $gt: 0 }})
          .sort({ count: -1, createdAt: -1 })
          .limit(50);
        
        // Tüm bağlı kullanıcılara güncel listeyi gönder
        io.emit('activitiesUpdate', activeActivities);
        
      } catch (error) {
        console.error('Error processing activity start:', error);
      }
    });

    // Aktivite bitirildiğinde
    socket.on('endActivity', async (name) => {
      console.log('Activity ended:', name);
      
      try {
        await connectMongoDB();
        
        // Aktiviteyi bul
        const activity = await ActivityModel.findOne({ name });
        
        if (activity) {
          // Sayıyı azalt
          activity.count = Math.max(0, activity.count - 1);
          activity.updatedAt = new Date();
          await activity.save();
          
          // Tüm etkin aktiviteleri al
          const activeActivities = await ActivityModel.find({ count: { $gt: 0 }})
            .sort({ count: -1, createdAt: -1 })
            .limit(50);
          
          // Tüm bağlı kullanıcılara güncel listeyi gönder
          io.emit('activitiesUpdate', activeActivities);
        }
      } catch (error) {
        console.error('Error processing activity end:', error);
      }
    });

    // Tüm aktiviteleri talep ettiğinde
    socket.on('getActivities', async () => {
      try {
        await connectMongoDB();
        
        // Tüm etkin aktiviteleri al
        const activeActivities = await ActivityModel.find({ count: { $gt: 0 }})
          .sort({ count: -1, createdAt: -1 })
          .limit(50);
        
        // İsteği yapan kullanıcıya gönder
        socket.emit('activitiesUpdate', activeActivities);
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
}); 