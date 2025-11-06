import apiClient from '../config';

class SafetyService {
  // Check drug interactions between multiple medicines
  async checkDrugInteractions(medicineIds: string[]): Promise<{
    interactions: Array<{
      medicine1: string;
      medicine2: string;
      type: string;
      description: string;
      severity: string;
      management?: string;
    }>;
  }> {
    try {
      const response = await apiClient.post('/safety/drug-interactions', {
        medicineIds
      });
      return response.data.data;
    } catch (error) {
      console.error('Error checking drug interactions:', error);
      return { interactions: [] };
    }
  }

  // Check patient allergies against prescribed medicines
  async checkPatientAllergies(patientId: string, medicineIds: string[]): Promise<{
    allergies: Array<{
      medicine: string;
      allergies: Array<{
        name: string;
        category: string;
        severity: string;
        notes?: string;
      }>;
    }>;
  }> {
    try {
      const response = await apiClient.post('/safety/patient-allergies', {
        patientId,
        medicineIds
      });
      return response.data.data;
    } catch (error) {
      console.error('Error checking patient allergies:', error);
      return { allergies: [] };
    }
  }

  // Get comprehensive safety report
  async getSafetyReport(patientId: string, medicineIds: string[]): Promise<{
    interactions: any[];
    allergies: any[];
    warnings: string[];
    recommendations: string[];
  }> {
    try {
      const [interactionsResult, allergiesResult] = await Promise.all([
        this.checkDrugInteractions(medicineIds),
        this.checkPatientAllergies(patientId, medicineIds)
      ]);

      const warnings = [];
      const recommendations = [];

      // Process interactions
      interactionsResult.interactions.forEach(interaction => {
        if (interaction.severity === 'High') {
          warnings.push(`HIGH RISK: ${interaction.description}`);
          if (interaction.management) {
            recommendations.push(`Management: ${interaction.management}`);
          }
        } else if (interaction.severity === 'Medium') {
          warnings.push(`MODERATE RISK: ${interaction.description}`);
        }
      });

      // Process allergies
      allergiesResult.allergies.forEach(allergyGroup => {
        allergyGroup.allergies.forEach(allergy => {
          if (allergy.severity === 'Severe') {
            warnings.push(`SEVERE ALLERGY: Patient is allergic to ${allergy.name} (${allergyGroup.medicine})`);
          } else if (allergy.severity === 'Moderate') {
            warnings.push(`MODERATE ALLERGY: Patient has ${allergy.severity.toLowerCase()} allergy to ${allergy.name} (${allergyGroup.medicine})`);
          }
        });
      });

      return {
        interactions: interactionsResult.interactions,
        allergies: allergiesResult.allergies,
        warnings,
        recommendations
      };
    } catch (error) {
      console.error('Error getting safety report:', error);
      return {
        interactions: [],
        allergies: [],
        warnings: [],
        recommendations: []
      };
    }
  }

  // Add new drug interaction
  async addDrugInteraction(interactionData: {
    medicine1Id: string;
    medicine2Id: string;
    interactionType: string;
    description: string;
    clinicalEffect?: string;
    management?: string;
    severity: string;
  }): Promise<{ interaction: any }> {
    try {
      const response = await apiClient.post('/safety/drug-interactions', interactionData);
      return response.data.data;
    } catch (error) {
      console.error('Error adding drug interaction:', error);
      throw error;
    }
  }

  // Get all drug interactions
  async getAllDrugInteractions(): Promise<{ interactions: any[] }> {
    try {
      const response = await apiClient.get('/safety/drug-interactions');
      return response.data.data;
    } catch (error) {
      console.error('Error getting drug interactions:', error);
      return { interactions: [] };
    }
  }
}

export default new SafetyService();
