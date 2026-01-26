import mongoose from 'mongoose';

const PatientSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  address: String,
  password: String,
  favoriteDoctorIds: [mongoose.Schema.Types.ObjectId],
});

export default mongoose.models.Patient || mongoose.model('Patient', PatientSchema);
