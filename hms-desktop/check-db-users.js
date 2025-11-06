// Check users directly from database
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabaseUsers() {
  try {
    console.log('🔍 Checking users in database...\n');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    console.log(`Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (${user.fullName}) - ${user.role} - Active: ${user.isActive}`);
    });

    // Try to create a test prescription with the first user
    if (users.length > 0) {
      const firstUser = users[0];
      console.log(`\n🧪 Testing prescription creation with user: ${firstUser.username}`);
      
      // Get patients
      const patients = await prisma.patient.findMany({ take: 1 });
      if (patients.length === 0) {
        console.log('No patients found, creating a test patient...');
        const patient = await prisma.patient.create({
          data: {
            name: 'Test Patient',
            age: 30,
            gender: 'MALE',
            phone: '1234567890',
            address: 'Test Address',
            bloodGroup: 'O+'
          }
        });
        console.log('✅ Test patient created');
        var patientId = patient.id;
      } else {
        var patientId = patients[0].id;
        console.log(`✅ Found patient: ${patients[0].name}`);
      }

      // Get medicines
      const medicines = await prisma.medicineCatalog.findMany({ take: 1 });
      if (medicines.length === 0) {
        console.log('No medicines found, creating a test medicine...');
        const medicine = await prisma.medicineCatalog.create({
          data: {
            name: 'Test Medicine',
            genericName: 'Test Generic',
            manufacturer: 'Test Manufacturer',
            category: 'Test Category',
            price: 10.50,
            quantity: 100,
            lowStockThreshold: 10,
            code: 'TEST001'
          }
        });
        console.log('✅ Test medicine created');
        var medicineId = medicine.id;
      } else {
        var medicineId = medicines[0].id;
        console.log(`✅ Found medicine: ${medicines[0].name}`);
      }

      // Create prescription
      console.log('\nCreating prescription...');
      const prescription = await prisma.prescription.create({
        data: {
          patientId: patientId,
          doctorId: firstUser.id,
          prescriptionNumber: 'TEST001',
          notes: 'Test prescription',
          totalAmount: 105.00,
          prescriptionItems: {
            create: [{
              medicineId: medicineId,
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
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseUsers();

