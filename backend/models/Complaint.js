const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ComplaintSchema = new Schema({
  day: { type: String, required: true },
  meal: { type: String, required: true },
  name: { type: String },
  rollNo: { type: String },
  complaint: { type: String, required: true },
  status: { type: String, default: 'Pending' }
}, { timestamps: true });
module.exports = mongoose.model('Complaint', ComplaintSchema);
