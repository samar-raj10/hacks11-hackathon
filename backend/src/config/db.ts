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

  const scenarios = [
    {
      hostel: 'North Hostel',
      block: 'A',
      mess: 'North Mess',
      waterSource: 'RO Plant',
      meal: 'Dinner',
      symptoms: ['Vomiting', 'Diarrhea', 'Abdominal pain', 'Fever'],
      severity: 'Severe',
      notes: 'Shared dinner in North Mess followed by GI symptoms across several students.',
    },
    {
      hostel: 'North Hostel',
      block: 'B',
      mess: 'North Mess',
      waterSource: 'Filtered Tank',
      meal: 'Lunch',
      symptoms: ['Nausea', 'Diarrhea', 'Weakness'],
      severity: 'Moderate',
      notes: 'Repeated lunch exposure at North Mess and proximity to a saturated water tank.',
    },
    {
      hostel: 'South Hostel',
      block: 'C',
      mess: 'South Mess',
      waterSource: 'Ground Water',
      meal: 'Dinner',
      symptoms: ['Fever', 'Headache', 'Body ache', 'Vomiting'],
      severity: 'Moderate',
      notes: 'Shared dinner plus groundwater source concerns raised repeated illness reports.',
    },
    {
      hostel: 'South Hostel',
      block: 'D',
      mess: 'South Mess',
      waterSource: 'Ground Water',
      meal: 'Breakfast',
      symptoms: ['Stomach upset', 'Nausea', 'Loss of appetite'],
      severity: 'Mild',
      notes: 'Breakfast service and tap water quality flagged for review.',
    },
    {
      hostel: 'East Hostel',
      block: 'E',
      mess: 'East Mess',
      waterSource: 'RO Plant',
      meal: 'Lunch',
      symptoms: ['Abdominal pain', 'Diarrhea', 'Dehydration'],
      severity: 'Moderate',
      notes: 'Multiple reports in same block after lunch service.',
    },
    {
      hostel: 'West Hostel',
      block: 'G',
      mess: 'West Mess',
      waterSource: 'Ground Water',
      meal: 'Dinner',
      symptoms: ['Fever', 'Diarrhea', 'Weakness'],
      severity: 'Severe',
      notes: 'Dining area and water quality concerns coincide with symptom clustering.',
    },
  ] as const;

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

  for (let index = 0; index < 64; index += 1) {
    const student = students[index % students.length];
    const scenario = scenarios[index % scenarios.length];
    const hoursAgo = 1 + ((index * 3) % 48);
    const mealCycle = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'][index % 4] as 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
    const severity = index % 7 === 0 ? 'Severe' : index % 3 === 0 ? 'Moderate' : 'Mild';
    const symptoms: string[] = [...scenario.symptoms];

    if (index % 5 === 0) {
      symptoms.push('Headache');
    }
    if (index % 9 === 0) {
      symptoms.push('Dizziness');
    }

    reportPayloads.push({
      studentId: student._id.toString(),
      symptoms: Array.from(new Set(symptoms)),
      severity,
      onsetAt: new Date(Date.now() - hoursAgo * 60 * 60 * 1000),
      hostel: student.hostel ?? scenario.hostel,
      block: student.block ?? scenario.block,
      exposure: {
        meal: (student.meal as 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks' | 'None' | 'Not sure') ?? scenario.meal ?? mealCycle,
        mess: student.mess ?? scenario.mess,
        waterSource: student.waterSource ?? scenario.waterSource,
        foodItems: ['rice', 'dal', 'vegetable curry', 'soup', 'salad'][0] ? ['rice', 'dal', 'vegetable curry', 'soup'] : ['rice', 'dal'],
        events: [
          `${scenario.meal.toLowerCase()} service shared seating`,
          'common queue pattern observed',
          'nearby block interaction',
        ].slice(0, 2),
        places: [student.hostel ?? scenario.hostel, student.mess ?? scenario.mess, student.block ?? scenario.block],
        notes: scenario.notes,
      },
      status: 'SUBMITTED',
    });
  }

  await HealthReport.insertMany(reportPayloads);
  console.log(`Seeded ${reportPayloads.length} demo health reports`);
};

