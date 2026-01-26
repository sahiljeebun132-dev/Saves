import mongoose from 'mongoose';

const DoctorCallLogSchema = new mongoose.Schema({
  timestamp: { type: String, required: true },
  patientName: String,
  patientPhone: String,
  location: {
    lat: Number,
    lng: Number,
  },
  report: String,
});

const DoctorSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  licenseNumber: String,
  specialty: String,
  experience: Number,
  clinicAddress: String,
  availableHours: String,
  location: {
    lat: Number,
    lng: Number,
  },
  password: String,
  callLogs: [DoctorCallLogSchema],
});

export default mongoose.models.Doctor || mongoose.model('Doctor', DoctorSchema);
