const mongoose = require('mongoose');
const User = require('./models/User');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms';

(async () => {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const user = await User.findOne({ email: 'admin@demo.com' }).lean();
    console.log('user', user);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
})();
