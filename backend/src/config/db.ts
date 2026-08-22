import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

import { HealthReport } from '../models/HealthReport.js';
import { User } from '../models/User.js';

const demoStudentTemplates = [
  { name: 'Aarav Mehta', hostel: 'North Hostel', block: 'A', room: 'A-101', mess: 'North Mess', waterSource: 'RO Plant', meal: 'Dinner' },
  { name: 'Diya Sharma', hostel: 'North Hostel', block: 'A', room: 'A-102', mess: 'North Mess', waterSource: 'RO Plant', meal: 'Lunch' },
  { name: 'Rohan Nair', hostel: 'North Hostel', block: 'B', room: 'B-206', mess: 'North Mess', waterSource: 'Filtered Tank', meal: 'Dinner' },
  { name: 'Ishita Verma', hostel: 'North Hostel', block: 'B', room: 'B-214', mess: 'North Mess', waterSource: 'Filtered Tank', meal: 'Lunch' },
  { name: 'Kabir Singh', hostel: 'South Hostel', block: 'C', room: 'C-118', mess: 'South Mess', waterSource: 'RO Plant', meal: 'Dinner' },
  { name: 'Sneha Rao', hostel: 'South Hostel', block: 'C', room: 'C-122', mess: 'South Mess', waterSource: 'RO Plant', meal: 'Breakfast' },
  { name: 'Yash Kapoor', hostel: 'South Hostel', block: 'D', room: 'D-308', mess: 'South Mess', waterSource: 'Ground Water', meal: 'Dinner' },
  { name: 'Ananya Pillai', hostel: 'South Hostel', block: 'D', room: 'D-314', mess: 'South Mess', waterSource: 'Ground Water', meal: 'Lunch' },
  { name: 'Vikram Joshi', hostel: 'East Hostel', block: 'E', room: 'E-410', mess: 'East Mess', waterSource: 'RO Plant', meal: 'Dinner' },
  { name: 'Meera Iyer', hostel: 'East Hostel', block: 'E', room: 'E-416', mess: 'East Mess', waterSource: 'RO Plant', meal: 'Lunch' },
  { name: 'Aditya Kumar', hostel: 'East Hostel', block: 'F', room: 'F-224', mess: 'East Mess', waterSource: 'Filtered Tank', meal: 'Dinner' },
  { name: 'Prerna Das', hostel: 'East Hostel', block: 'F', room: 'F-220', mess: 'East Mess', waterSource: 'Filtered Tank', meal: 'Dinner' },
  { name: 'Siddharth Roy', hostel: 'West Hostel', block: 'G', room: 'G-118', mess: 'West Mess', waterSource: 'Ground Water', meal: 'Dinner' },
  { name: 'Naina Khanna', hostel: 'West Hostel', block: 'G', room: 'G-136', mess: 'West Mess', waterSource: 'Ground Water', meal: 'Lunch' },
  { name: 'Mohit Bansal', hostel: 'West Hostel', block: 'H', room: 'H-404', mess: 'West Mess', waterSource: 'RO Plant', meal: 'Breakfast' },
  { name: 'Ritika Malhotra', hostel: 'West Hostel', block: 'H', room: 'H-420', mess: 'West Mess', waterSource: 'RO Plant', meal: 'Dinner' },
];

const symptomPatterns = [
  ['fever', 'headache', 'body ache'],
  ['nausea', 'vomiting', 'diarrhea'],
  ['abdominal pain', 'diarrhea', 'weakness'],
  ['fever', 'diarrhea', 'dehydration'],
  ['headache', 'dizziness', 'weakness'],
  ['stomach upset', 'loss of appetite', 'nausea'],
];

export const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/campusshield';

  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
    await seedDemoUsers();
    await seedDemoHealthReports();
  } catch (error) {
    console.error('MongoDB connection failed:', error);
  }
};

export const seedDemoUsers = async () => {
  const defaults: Array<{
    name: string;
    email: string;
    password: string;
    role: 'SYSTEM_ADMIN' | 'HEALTH_ADMIN' | 'FACILITY_MANAGER' | 'STUDENT';
    hostel?: string;
    block?: string;
    room?: string;
    mess?: string;
    waterSource?: string;
    meal?: string;
  }> = [
    { name: 'System Admin', email: 'admin@campusshield.local', password: 'Admin@123', role: 'SYSTEM_ADMIN' },
    { name: 'Health Admin', email: 'health@campusshield.local', password: 'Health@123', role: 'HEALTH_ADMIN' },
    { name: 'Facility Manager', email: 'facility@campusshield.local', password: 'Facility@123', role: 'FACILITY_MANAGER' },
    { name: 'Student Demo', email: 'student@campusshield.local', password: 'Student@123', role: 'STUDENT', hostel: 'North Hostel', block: 'A', room: 'A-101', mess: 'North Mess', waterSource: 'RO Plant', meal: 'Dinner' },
  ];

  for (const user of defaults) {
    const exists = await User.findOne({ email: user.email.toLowerCase() });
    if (!exists) {
      await User.create({
        name: user.name,
        email: user.email.toLowerCase(),
        passwordHash: await bcrypt.hash(user.password, 10),
        role: user.role,
        studentId: user.role === 'STUDENT' ? 'CS-1001' : undefined,
        hostel: user.hostel,
        block: user.block,
        room: user.room,
        mess: user.mess,
        waterSource: user.waterSource,
        meal: user.meal,
        isActive: true,
      });
    }
  }

  for (const [index, template] of demoStudentTemplates.entries()) {
    const email = `student${index + 1}@campusshield.local`;
    const studentId = `CS-${1000 + index + 1}`;
    const exists = await User.findOne({ email });
    if (!exists) {
      await User.create({
        name: template.name,
        email,
        passwordHash: await bcrypt.hash('Student@123', 10),
        role: 'STUDENT',
        studentId,
        hostel: template.hostel,
        block: template.block,
        room: template.room,
        mess: template.mess,
        waterSource: template.waterSource,
        meal: template.meal,
        isActive: true,
      });
    }
  }
};

export const seedDemoHealthReports = async () => {
  const existingReports = await HealthReport.countDocuments();
  if (existingReports > 0) {
    return;
  }

  const students = await User.find({ role: 'STUDENT' }).lean();
  if (students.length === 0) {
    return;
  }

  const reportPayloads = [] as Array<{
    studentId: string;
    symptoms: string[];
    severity: 'Mild' | 'Moderate' | 'Severe';
    onsetAt: Date;
    hostel: string;
    block: string;
    exposure: { meal: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks' | 'None' | 'Not sure'; mess: string; waterSource: string; foodItems: string[]; events: string[]; places: string[]; notes: string };
    status: 'SUBMITTED';
  }>;

  for (let index = 0; index < 18; index += 1) {
    const student = students[index % students.length];
    const pattern = symptomPatterns[index % symptomPatterns.length];
    const hoursAgo = 4 + ((index * 3) % 36);
    const rawMeal = typeof student.meal === 'string' ? student.meal : 'Dinner';
    const validMeals = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'None', 'Not sure'] as const;
    const meal = validMeals.includes(rawMeal as (typeof validMeals)[number]) ? rawMeal : 'Dinner';

    reportPayloads.push({
      studentId: student._id.toString(),
      symptoms: pattern,
      severity: index % 4 === 0 ? 'Severe' : index % 2 === 0 ? 'Moderate' : 'Mild',
      onsetAt: new Date(Date.now() - hoursAgo * 60 * 60 * 1000),
      hostel: student.hostel ?? 'North Hostel',
      block: student.block ?? 'A',
      exposure: {
        meal,
        mess: student.mess ?? 'North Mess',
        waterSource: student.waterSource ?? 'RO Plant',
        foodItems: ['rice', 'dal', 'vegetable curry'],
        events: ['shared dinner seating', 'mess queue congestion'],
        places: [student.hostel ?? 'North Hostel', student.mess ?? 'North Mess'],
        notes: 'Reported symptoms after shared dining time in the hostel dining area.',
      },
      status: 'SUBMITTED',
    });
  }

  await HealthReport.insertMany(reportPayloads);
  console.log(`Seeded ${reportPayloads.length} demo health reports`);
};

