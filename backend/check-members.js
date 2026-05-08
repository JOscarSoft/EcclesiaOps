const mongoose = require('mongoose');

async function checkData() {
  await mongoose.connect('mongodb://localhost:27017/tenant_fase6');
  console.log('Connected to tenant_fase6');

  const Member = mongoose.model('Member', new mongoose.Schema({ isActive: Boolean }, { strict: false }), 'members');
  const count = await Member.countDocuments({ isActive: true });
  console.log('Total Active Members:', count);

  const sample = await Member.findOne({ isActive: true });
  console.log('Sample Member:', sample);

  await mongoose.disconnect();
}

checkData().catch(console.error);
