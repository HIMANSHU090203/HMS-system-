// Simple prescription creation test
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPrescriptionCreation() {
  try {
    console.log('🧪 Testing simple prescription creation...\n');

    // Get a user
    const user = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!user) {
      throw new Error('No admin user found');
    }

    console.log('Using user:', user.username);

    // Get a patient
    const patient = await prisma.patient.findFirst();
    if (!patient) {
      throw new Error('No patient found');
    }

    console.log('Using patient:', patient.name);

    // Get a medicine
    const medicine = await prisma.medicineCatalog.findFirst();
    if (!medicine) {
      throw new Error('No medicine found');
    }

    console.log('Using medicine:', medicine.name);

    // Create prescription
    const prescription = await prisma.prescription.create({
      data: {
        patientId: patient.id,
        doctorId: user.id,
        prescriptionNumber: 'TEST' + Date.now(),
        notes: 'Test prescription',
        totalAmount: 100.00,
        prescriptionItems: {
          create: [{
            medicineId: medicine.id,
            quantity: 10,
            frequency: '1-0-1',
            duration: 7,
            instructions: 'Take with food',
            dosage: '500mg',
            withFood: 'With meal',
            rowOrder: 0
          }]
        }
      },
      include: {
        patient: true,
        doctor: true,
        prescriptionItems: {
          include: {
            medicine: true
          }
        }
      }
    });

    console.log('✅ Prescription created successfully!');
    console.log('Prescription ID:', prescription.id);
    console.log('Prescription Number:', prescription.prescriptionNumber);
    console.log('Patient:', prescription.patient.name);
    console.log('Doctor:', prescription.doctor.fullName);
    console.log('Items:', prescription.prescriptionItems.length);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testPrescriptionCreation();

