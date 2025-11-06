import { PrismaClient, WardType, BedType, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedIPDData() {
  console.log('🌱 Seeding IPD data...');

  try {
    // Create IPD-specific users
    const ipdUsers = [
      {
        username: 'nurse1',
        password: 'nurse123',
        fullName: 'Sarah Johnson',
        role: UserRole.NURSE,
      },
      {
        username: 'nurse2',
        password: 'nurse123',
        fullName: 'Michael Brown',
        role: UserRole.NURSE,
      },
      {
        username: 'ward_manager',
        password: 'ward123',
        fullName: 'Emily Davis',
        role: UserRole.WARD_MANAGER,
      },
      {
        username: 'ipd_doctor',
        password: 'ipd123',
        fullName: 'Dr. Robert Wilson',
        role: UserRole.DOCTOR,
      },
      {
        username: 'nursing_supervisor',
        password: 'super123',
        fullName: 'Lisa Anderson',
        role: UserRole.NURSING_SUPERVISOR,
      },
    ];

    for (const userData of ipdUsers) {
      const existingUser = await prisma.user.findUnique({
        where: { username: userData.username },
      });

      if (!existingUser) {
        const passwordHash = await bcrypt.hash(userData.password, 12);
        await prisma.user.create({
          data: {
            username: userData.username,
            passwordHash,
            fullName: userData.fullName,
            role: userData.role,
            isActive: true,
          },
        });
        console.log(`✅ Created ${userData.role} user: ${userData.username}`);
      } else {
        console.log(`⏭️  User already exists: ${userData.username}`);
      }
    }

    // Create wards
    const wards = [
      {
        name: 'General Ward A',
        type: WardType.GENERAL,
        capacity: 20,
        description: 'General medical ward for adult patients',
        floor: '2nd Floor',
      },
      {
        name: 'General Ward B',
        type: WardType.GENERAL,
        capacity: 15,
        description: 'General medical ward for adult patients',
        floor: '2nd Floor',
      },
      {
        name: 'ICU Unit',
        type: WardType.ICU,
        capacity: 8,
        description: 'Intensive Care Unit for critical patients',
        floor: '3rd Floor',
      },
      {
        name: 'Private Ward',
        type: WardType.PRIVATE,
        capacity: 12,
        description: 'Private rooms for VIP patients',
        floor: '4th Floor',
      },
      {
        name: 'Emergency Ward',
        type: WardType.EMERGENCY,
        capacity: 10,
        description: 'Emergency observation ward',
        floor: '1st Floor',
      },
      {
        name: 'Pediatric Ward',
        type: WardType.PEDIATRIC,
        capacity: 16,
        description: 'Pediatric ward for children',
        floor: '2nd Floor',
      },
      {
        name: 'Maternity Ward',
        type: WardType.MATERNITY,
        capacity: 14,
        description: 'Maternity ward for mothers and newborns',
        floor: '3rd Floor',
      },
      {
        name: 'Surgical Ward',
        type: WardType.SURGICAL,
        capacity: 18,
        description: 'Post-surgical recovery ward',
        floor: '3rd Floor',
      },
    ];

    const createdWards = [];
    for (const wardData of wards) {
      const existingWard = await prisma.ward.findUnique({
        where: { name: wardData.name },
      });

      if (!existingWard) {
        const ward = await prisma.ward.create({
          data: wardData,
        });
        createdWards.push(ward);
        console.log(`✅ Created ward: ${ward.name}`);
      } else {
        createdWards.push(existingWard);
        console.log(`⏭️  Ward already exists: ${wardData.name}`);
      }
    }

    // Create beds for each ward
    for (const ward of createdWards) {
      const bedCount = ward.capacity;
      const bedType = ward.type === WardType.ICU ? BedType.ICU : 
                     ward.type === WardType.PRIVATE ? BedType.PRIVATE :
                     ward.type === WardType.EMERGENCY ? BedType.GENERAL : BedType.GENERAL;

      for (let i = 1; i <= bedCount; i++) {
        const bedNumber = `${ward.name.split(' ')[0]}${i.toString().padStart(2, '0')}`;
        
        const existingBed = await prisma.bed.findFirst({
          where: {
            wardId: ward.id,
            bedNumber,
          },
        });

        if (!existingBed) {
          await prisma.bed.create({
            data: {
              wardId: ward.id,
              bedNumber,
              bedType,
              isOccupied: false,
              isActive: true,
            },
          });
        }
      }
      console.log(`✅ Created ${bedCount} beds for ${ward.name}`);
    }

    // Create some sample admissions (if patients exist)
    const patients = await prisma.patient.findMany({ take: 3 });
    const availableBeds = await prisma.bed.findMany({
      where: { isOccupied: false },
      include: { ward: true },
      take: 3,
    });

    if (patients.length > 0 && availableBeds.length > 0) {
      const ipdDoctor = await prisma.user.findFirst({
        where: { role: UserRole.DOCTOR },
      });

      if (ipdDoctor) {
        for (let i = 0; i < Math.min(patients.length, availableBeds.length); i++) {
          const patient = patients[i];
          const bed = availableBeds[i];

          // Check if patient is already admitted
          const existingAdmission = await prisma.admission.findFirst({
            where: {
              patientId: patient.id,
              status: 'ADMITTED',
            },
          });

          if (!existingAdmission) {
            await prisma.$transaction(async (tx) => {
              // Create admission
              await tx.admission.create({
                data: {
                  patientId: patient.id,
                  wardId: bed.wardId,
                  bedId: bed.id,
                  admissionDate: new Date(),
                  admissionType: 'PLANNED',
                  admissionReason: 'Sample admission for testing',
                  status: 'ADMITTED',
                  admittedBy: ipdDoctor.id,
                },
              });

              // Update bed as occupied
              await tx.bed.update({
                where: { id: bed.id },
                data: { isOccupied: true },
              });

              // Update ward occupancy
              await tx.ward.update({
                where: { id: bed.wardId },
                data: {
                  currentOccupancy: {
                    increment: 1,
                  },
                },
              });

              // Update patient type
              await tx.patient.update({
                where: { id: patient.id },
                data: { patientType: 'INPATIENT' },
              });
            });

            console.log(`✅ Created sample admission for patient: ${patient.name}`);
          }
        }
      }
    }

    console.log('🎉 IPD data seeding completed successfully!');
    console.log('\n📋 IPD User Credentials:');
    console.log('👩‍⚕️ Nurse 1: nurse1 / nurse123');
    console.log('👨‍⚕️ Nurse 2: nurse2 / nurse123');
    console.log('👩‍💼 Ward Manager: ward_manager / ward123');
    console.log('👨‍⚕️ IPD Doctor: ipd_doctor / ipd123');
    console.log('👩‍💼 Nursing Supervisor: nursing_supervisor / super123');

  } catch (error) {
    console.error('❌ Error seeding IPD data:', error);
    throw error;
  }
}

// Run the seed function
seedIPDData()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
