import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get the hospital ID from the database
 * Returns the first hospital config ID or null if none exists
 * 
 * Note: Currently single-tenant - uses HospitalConfig table
 * For multi-tenancy, this should be retrieved from user context
 */
export async function getHospitalId(): Promise<string | null> {
  try {
    // Fixed: Use HospitalConfig table instead of non-existent "hospitals" table
    const hospitalConfig = await prisma.hospitalConfig.findFirst({
      select: { id: true }
    });
    
    if (hospitalConfig) {
      return hospitalConfig.id;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting hospital ID:', error);
    return null;
  }
}

/**
 * Get hospital ID with fallback - throws error if not found
 */
export async function getRequiredHospitalId(): Promise<string> {
  const hospitalId = await getHospitalId();
  if (!hospitalId) {
    throw new Error('No hospital configuration found in database. Please configure hospital settings first.');
  }
  return hospitalId;
}

/**
 * Get full hospital configuration
 * Returns the hospital config with all details
 */
export async function getHospitalConfig() {
  try {
    const hospitalConfig = await prisma.hospitalConfig.findFirst();
    return hospitalConfig;
  } catch (error) {
    console.error('Error getting hospital config:', error);
    return null;
  }
}

