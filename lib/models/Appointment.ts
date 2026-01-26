import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  date: String,
  time: String,
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'] },
  report: String,
});

export default mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);
