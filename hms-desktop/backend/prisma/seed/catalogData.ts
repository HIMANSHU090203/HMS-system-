// Medical Catalog Seed Data for Phase 1

export const allergyCatalogData = [
  // Food Allergies
  { code: 'ALG001', name: 'Peanuts', category: 'Food', severity: 'Severe' },
  { code: 'ALG002', name: 'Milk', category: 'Food', severity: 'Moderate' },
  { code: 'ALG003', name: 'Eggs', category: 'Food', severity: 'Moderate' },
  { code: 'ALG004', name: 'Shellfish', category: 'Food', severity: 'Severe' },
  { code: 'ALG005', name: 'Soy', category: 'Food', severity: 'Mild' },
  { code: 'ALG006', name: 'Wheat', category: 'Food', severity: 'Moderate' },
  { code: 'ALG007', name: 'Fish', category: 'Food', severity: 'Moderate' },
  { code: 'ALG008', name: 'Sesame', category: 'Food', severity: 'Severe' },
  
  // Drug Allergies
  { code: 'ALG101', name: 'Penicillin', category: 'Drug', severity: 'Severe' },
  { code: 'ALG102', name: 'Aspirin', category: 'Drug', severity: 'Moderate' },
  { code: 'ALG103', name: 'Sulfonamides', category: 'Drug', severity: 'Moderate' },
  { code: 'ALG104', name: 'Cephalosporins', category: 'Drug', severity: 'Mild' },
  { code: 'ALG105', name: 'Non-Steroidal Anti-Inflammatory Drugs (NSAIDs)', category: 'Drug', severity: 'Severe' },
  { code: 'ALG106', name: 'Iodine Contrast', category: 'Drug', severity: 'Severe' },
  { code: 'ALG107', name: 'Local Anesthetics', category: 'Drug', severity: 'Mild' },
  { code: 'ALG108', name: 'Opioids', category: 'Drug', severity: 'Moderate' },
  
  // Environmental Allergies
  { code: 'ALG201', name: 'Dust Mites', category: 'Environmental', severity: 'Moderate' },
  { code: 'ALG202', name: 'Pollen', category: 'Environmental', severity: 'Moderate' },
  { code: 'ALG203', name: 'Mold', category: 'Environmental', severity: 'Mild' },
  { code: 'ALG204', name: 'Pet Dander', category: 'Environmental', severity: 'Moderate' },
  { code: 'ALG205', name: 'Latex', category: 'Environmental', severity: 'Severe' },
  { code: 'ALG206', name: 'Insect Stings', category: 'Environmental', severity: 'Severe' },
  { code: 'ALG207', name: 'Cockroach', category: 'Environmental', severity: 'Moderate' },
];

export const chronicConditionData = [
  // Cardiovascular Conditions
  { code: 'CHR001', name: 'Hypertension', category: 'Cardiovascular' },
  { code: 'CHR002', name: 'Coronary Artery Disease', category: 'Cardiovascular' },
  { code: 'CHR003', name: 'Heart Failure', category: 'Cardiovascular' },
  { code: 'CHR004', name: 'Atrial Fibrillation', category: 'Cardiovascular' },
  { code: 'CHR005', name: 'Peripheral Artery Disease', category: 'Cardiovascular' },
  
  // Endocrine Conditions
  { code: 'CHR101', name: 'Type 2 Diabetes', category: 'Endocrine' },
  { code: 'CHR102', name: 'Type 1 Diabetes', category: 'Endocrine' },
  { code: 'CHR103', name: 'Hypothyroidism', category: 'Endocrine' },
  { code: 'CHR104', name: 'Hyperthyroidism', category: 'Endocrine' },
  { code: 'CHR105', name: 'Obesity', category: 'Endocrine' },
  
  // Respiratory Conditions
  { code: 'CHR201', name: 'Asthma', category: 'Respiratory' },
  { code: 'CHR202', name: 'Chronic Obstructive Pulmonary Disease (COPD)', category: 'Respiratory' },
  { code: 'CHR203', name: 'Chronic Bronchitis', category: 'Respiratory' },
  { code: 'CHR204', name: 'Sleep Apnea', category: 'Respiratory' },
  
  // Gastrointestinal Conditions
  { code: 'CHR301', name: 'Gastroesophageal Reflux Disease (GERD)', category: 'Gastrointestinal' },
  { code: 'CHR302', name: 'Irritable Bowel Syndrome (IBS)', category: 'Gastrointestinal' },
  { code: 'CHR303', name: 'Inflammatory Bowel Disease', category: 'Gastrointestinal' },
  { code: 'CHR304', name: 'Chronic Liver Disease', category: 'Gastrointestinal' },
  
  // Neurological Conditions
  { code: 'CHR401', name: 'Epilepsy', category: 'Neurological' },
  { code: 'CHR402', name: 'Parkinson Disease', category: 'Neurological' },
  { code: 'CHR403', name: 'Multiple Sclerosis', category: 'Neurological' },
  { code: 'CHR404', name: 'Migraine', category: 'Neurological' },
  
  // Musculoskeletal Conditions
  { code: 'CHR501', name: 'Osteoarthritis', category: 'Musculoskeletal' },
  { code: 'CHR502', name: 'Rheumatoid Arthritis', category: 'Musculoskeletal' },
  { code: 'CHR503', name: 'Osteoporosis', category: 'Musculoskeletal' },
  { code: 'CHR504', name: 'Chronic Low Back Pain', category: 'Musculoskeletal' },
];

export const commonDiagnosesData = [
  // Common Acute Conditions (ICD-10 style codes)
  { icdCode: 'J00', name: 'Common Cold', category: 'Acute Respiratory' },
  { icdCode: 'J06.9', name: 'Upper Respiratory Tract Infection', category: 'Acute Respiratory' },
  { icdCode: 'K59.0', name: 'Constipation', category: 'Gastrointestinal' },
  { icdCode: 'R51', name: 'Headache', category: 'Neurological' },
  { icdCode: 'M79.3', name: 'Muscle Pain (Myalgia)', category: 'Musculoskeletal' },
  { icdCode: 'N30.0', name: 'Acute Cystitis', category: 'Genitourinary' },
  
  // Chronic Conditions
  { icdCode: 'E11.9', name: 'Type 2 Diabetes Without Complications', category: 'Endocrine' },
  { icdCode: 'I10', name: 'Essential Hypertension', category: 'Cardiovascular' },
  { icdCode: 'J45.9', name: 'Asthma Unspecified', category: 'Respiratory' },
  
  // Infections
  { icdCode: 'A09', name: 'Infectious Gastroenteritis', category: 'Infectious Disease' },
  { icdCode: 'J18.9', name: 'Pneumonia', category: 'Infectious Disease' },
  { icdCode: 'N39.0', name: 'Urinary Tract Infection', category: 'Genitourinary' },
];

export const commonMedicinesData = [
  // Analgesics
  { code: 'MED001', name: 'Paracetamol', genericName: 'Acetaminophen', manufacturer: 'Generic', category: 'Analgesic', therapeuticClass: 'NSAID', atcCode: 'N02BE01', price: 0.50 },
  { code: 'MED002', name: 'Ibuprofen', genericName: 'Ibuprofen', manufacturer: 'Generic', category: 'Analgesic', therapeuticClass: 'NSAID', atcCode: 'M01AE01', price: 0.75 },
  { code: 'MED003', name: 'Diclofenac', genericName: 'Diclofenac Sodium', manufacturer: 'Generic', category: 'Analgesic', therapeuticClass: 'NSAID', atcCode: 'M01AB05', price: 0.80 },
  
  // Antibiotics
  { code: 'MED101', name: 'Amoxicillin', genericName: 'Amoxicillin', manufacturer: 'Generic', category: 'Antibiotic', therapeuticClass: 'Penicillin', atcCode: 'J01CA04', price: 2.50 },
  { code: 'MED102', name: 'Azithromycin', genericName: 'Azithromycin', manufacturer: 'Generic', category: 'Antibiotic', therapeuticClass: 'Macrolide', atcCode: 'J01FA10', price: 5.00 },
  { code: 'MED103', name: 'Ciprofloxacin', genericName: 'Ciprofloxacin', manufacturer: 'Generic', category: 'Antibiotic', therapeuticClass: 'Fluoroquinolone', atcCode: 'J01MA02', price: 3.00 },
  { code: 'MED104', name: 'Cefixime', genericName: 'Cefixime', manufacturer: 'Generic', category: 'Antibiotic', therapeuticClass: 'Cephalosporin', atcCode: 'J01DD08', price: 8.00 },
  
  // Antacids
  { code: 'MED201', name: 'Omeprazole', genericName: 'Omeprazole', manufacturer: 'Generic', category: 'Antacid', therapeuticClass: 'Proton Pump Inhibitor', atcCode: 'A02BC01', price: 1.50 },
  { code: 'MED202', name: 'Pantoprazole', genericName: 'Pantoprazole', manufacturer: 'Generic', category: 'Antacid', therapeuticClass: 'Proton Pump Inhibitor', atcCode: 'A02BC02', price: 1.60 },
  
  // Antihypertensives
  { code: 'MED301', name: 'Amlodipine', genericName: 'Amlodipine Besylate', manufacturer: 'Generic', category: 'Antihypertensive', therapeuticClass: 'Calcium Channel Blocker', atcCode: 'C08CA01', price: 3.50 },
  { code: 'MED302', name: 'Losartan', genericName: 'Losartan Potassium', manufacturer: 'Generic', category: 'Antihypertensive', therapeuticClass: 'ARB', atcCode: 'C09CA01', price: 4.00 },
  
  // Antidiabetics
  { code: 'MED401', name: 'Metformin', genericName: 'Metformin HCl', manufacturer: 'Generic', category: 'Antidiabetic', therapeuticClass: 'Biguanide', atcCode: 'A10BA02', price: 2.00 },
  { code: 'MED402', name: 'Glibenclamide', genericName: 'Glibenclamide', manufacturer: 'Generic', category: 'Antidiabetic', therapeuticClass: 'Sulfonylurea', atcCode: 'A10BB01', price: 1.80 },
];

// Lab Test Catalog Seed Data - Comprehensive Laboratory Tests
export const labTestCatalogData = [
  // General Laboratory Tests
  { testName: 'CBC (Complete Blood Count)', description: 'Complete blood count with differential', category: 'General', price: 150, units: 'N/A', referenceRange: 'Primary Sample Type: Blood|HEMOGLOBIN:|Hemoglobin (Hb): 13.0-17.0 g/dL|RBC COUNT:|Total RBC count: 4.5-5.5 mill/cumm|BLOOD INDICES:|Packed Cell Volume (PCV): 40-50 %|Mean Corpuscular Volume (MCV): 83-101 fL|MCH: 27-32 pg|MCHC: 32.5-34.5 g/dL|RDW: 11.6-14.0 %|WBC COUNT:|Total WBC count: 4000-11000 cumm|DIFFERENTIAL WBC COUNT:|Neutrophils: 50-62 %|Lymphocytes: 20-40 %|Eosinophils: 00-06 %|Monocytes: 00-10 %|Basophils: 00-02 %|PLATELET COUNT:|Platelet Count: 150000-410000 cumm' },

  // Biochemistry Profiles with detailed datapoints
  { testName: 'Liver Function Test (LFT)', description: 'Comprehensive liver panel', category: 'Biochemistry', price: 600, units: 'N/A', referenceRange: 'BILIRUBIN:|Total Bilirubin: 0.3-1.2 mg/dL|Direct Bilirubin: 0.0-0.3 mg/dL|Indirect Bilirubin: 0.2-0.9 mg/dL|ENZYMES:|SGOT (AST): 5-40 U/L|SGPT (ALT): 5-41 U/L|Alkaline Phosphatase: 44-147 U/L|PROTEINS:|Total Protein: 6.0-8.3 g/dL|Albumin: 3.5-5.0 g/dL|Globulin: 2.3-3.4 g/dL|A/G Ratio: 1.0-2.2' },
  { testName: 'Kidney Function Test (KFT)', description: 'Renal panel', category: 'Biochemistry', price: 550, units: 'N/A', referenceRange: 'Urea: 17-43 mg/dL|Creatinine: 0.7-1.3 mg/dL|Uric Acid: 3.4-7.0 mg/dL|Electrolytes:|Sodium (Na+): 135-145 mEq/L|Potassium (K+): 3.5-5.1 mEq/L|Chloride (Cl-): 98-107 mEq/L|Calcium: 8.5-10.5 mg/dL|Phosphorus: 2.5-4.5 mg/dL' },
  { testName: 'Lipid Profile', description: 'Lipid panel', category: 'Biochemistry', price: 500, units: 'N/A', referenceRange: 'Total Cholesterol: <200 mg/dL|Triglycerides: <150 mg/dL|HDL Cholesterol: >40 mg/dL|LDL Cholesterol: <100 mg/dL|VLDL: 10-40 mg/dL|TC/HDL Ratio: <4.5|LDL/HDL Ratio: <3.0' },
  { testName: 'Thyroid Profile (T3, T4, TSH)', description: 'Thyroid function tests', category: 'Endocrinology', price: 650, units: 'N/A', referenceRange: 'Total T3: 0.8-2.0 ng/mL|Total T4: 5.1-14.1 μg/dL|TSH: 0.4-4.0 mIU/L' },

  // Pathology with structured datapoints
  { testName: 'Urinalysis (Routine)', description: 'Routine urine examination', category: 'Pathology', price: 200, units: 'N/A', referenceRange: 'PHYSICAL EXAMINATION:|Color: Yellow|Appearance: Clear|pH: 4.5-8.0|Specific Gravity: 1.005-1.030|CHEMICAL EXAMINATION:|Protein: Negative|Glucose: Negative|Ketones: Negative|Blood: Negative|MICROSCOPIC EXAMINATION:|Pus Cells: <5 cells/HPF|RBCs: <3 cells/HPF|Epithelial Cells: Few' },
  { testName: 'Stool Routine Examination', description: 'Microscopic and macroscopic stool exam', category: 'Pathology', price: 250, units: 'N/A', referenceRange: 'Color: Brown|Consistency: Formed|Occult Blood: Negative|Ova/Cysts: Not seen' },
  { testName: 'LFT (Liver Function Test)', description: 'Liver function panel', category: 'General', price: 200, units: 'U/L', referenceRange: 'ALT: 7-56 U/L, AST: 10-40 U/L, Bilirubin: 0.3-1.2 mg/dL' },
  { testName: 'KFT (Kidney Function Test)', description: 'Kidney function panel', category: 'General', price: 180, units: 'mg/dL', referenceRange: 'Creatinine: 0.6-1.2 mg/dL, BUN: 7-20 mg/dL' },
  { testName: 'Blood Sugar (Fasting)', description: 'Fasting blood glucose', category: 'General', price: 80, units: 'mg/dL', referenceRange: '70-100 mg/dL' },
  { testName: 'Blood Sugar (Random)', description: 'Random blood glucose', category: 'General', price: 80, units: 'mg/dL', referenceRange: '70-140 mg/dL' },
  { testName: 'HbA1c', description: 'Glycated hemoglobin', category: 'General', price: 300, units: '%', referenceRange: '<5.7%' },
  { testName: 'Lipid Profile', description: 'Complete lipid panel', category: 'General', price: 250, units: 'mg/dL', referenceRange: 'Total Cholesterol: <200 mg/dL, LDL: <100 mg/dL, HDL: >40 mg/dL' },
  { testName: 'Thyroid Function Test (TFT)', description: 'Thyroid hormone panel', category: 'General', price: 400, units: 'mIU/L', referenceRange: 'TSH: 0.4-4.0 mIU/L, T3: 80-200 ng/dL, T4: 4.5-12.5 μg/dL' },
  { testName: 'Urine Routine', description: 'Complete urinalysis', category: 'General', price: 120, units: 'N/A', referenceRange: 'pH: 4.5-8.0, Specific Gravity: 1.005-1.030' },
  { testName: 'Stool Routine', description: 'Stool examination', category: 'General', price: 100, units: 'N/A', referenceRange: 'No parasites, blood, or abnormal findings' },
  { testName: 'ESR (Erythrocyte Sedimentation Rate)', description: 'Sedimentation rate', category: 'General', price: 80, units: 'mm/hr', referenceRange: 'Male: 0-15 mm/hr, Female: 0-20 mm/hr' },
  { testName: 'CRP (C-Reactive Protein)', description: 'Inflammation marker', category: 'General', price: 200, units: 'mg/L', referenceRange: '<3.0 mg/L' },
  { testName: 'Vitamin B12', description: 'Vitamin B12 level', category: 'General', price: 500, units: 'pg/mL', referenceRange: '200-900 pg/mL' },
  { testName: 'Vitamin D', description: '25-Hydroxyvitamin D', category: 'General', price: 600, units: 'ng/mL', referenceRange: '30-100 ng/mL' },
  { testName: 'Iron Studies', description: 'Iron profile', category: 'General', price: 350, units: 'μg/dL', referenceRange: 'Iron: 60-170 μg/dL, Ferritin: 15-200 ng/mL' },
  
  // MRI Laboratory Tests
  { testName: 'MRI Brain', description: 'Magnetic resonance imaging of brain', category: 'MRI', price: 5000, units: 'Images', referenceRange: 'No acute intracranial abnormalities' },
  { testName: 'MRI Spine (Cervical)', description: 'MRI of cervical spine', category: 'MRI', price: 6000, units: 'Images', referenceRange: 'No spinal cord compression or disc herniation' },
  { testName: 'MRI Spine (Thoracic)', description: 'MRI of thoracic spine', category: 'MRI', price: 6000, units: 'Images', referenceRange: 'No spinal cord compression or disc herniation' },
  { testName: 'MRI Spine (Lumbar)', description: 'MRI of lumbar spine', category: 'MRI', price: 6000, units: 'Images', referenceRange: 'No spinal cord compression or disc herniation' },
  { testName: 'MRI Knee', description: 'MRI of knee joint', category: 'MRI', price: 4500, units: 'Images', referenceRange: 'No ligament tears or meniscal injuries' },
  { testName: 'MRI Shoulder', description: 'MRI of shoulder joint', category: 'MRI', price: 4500, units: 'Images', referenceRange: 'No rotator cuff tears or labral injuries' },
  { testName: 'MRI Abdomen', description: 'MRI of abdomen and pelvis', category: 'MRI', price: 7000, units: 'Images', referenceRange: 'No masses or organ abnormalities' },
  { testName: 'MRI Heart', description: 'Cardiac MRI', category: 'MRI', price: 8000, units: 'Images', referenceRange: 'Normal cardiac function and structure' },
  
  // CT Scan Laboratory Tests
  { testName: 'CT Head', description: 'Computed tomography of head', category: 'CT Scan', price: 3000, units: 'Images', referenceRange: 'No acute intracranial abnormalities' },
  { testName: 'CT Chest', description: 'CT scan of chest', category: 'CT Scan', price: 3500, units: 'Images', referenceRange: 'No pulmonary nodules or masses' },
  { testName: 'CT Abdomen', description: 'CT scan of abdomen', category: 'CT Scan', price: 4000, units: 'Images', referenceRange: 'No masses or organ abnormalities' },
  { testName: 'CT Pelvis', description: 'CT scan of pelvis', category: 'CT Scan', price: 3500, units: 'Images', referenceRange: 'No masses or organ abnormalities' },
  { testName: 'CT Spine (Cervical)', description: 'CT of cervical spine', category: 'CT Scan', price: 3000, units: 'Images', referenceRange: 'No fractures or disc herniation' },
  { testName: 'CT Spine (Thoracic)', description: 'CT of thoracic spine', category: 'CT Scan', price: 3000, units: 'Images', referenceRange: 'No fractures or disc herniation' },
  { testName: 'CT Spine (Lumbar)', description: 'CT of lumbar spine', category: 'CT Scan', price: 3000, units: 'Images', referenceRange: 'No fractures or disc herniation' },
  { testName: 'CT Angiography', description: 'CT angiogram', category: 'CT Scan', price: 5000, units: 'Images', referenceRange: 'No vascular abnormalities or stenosis' },
  
  // X-Ray Laboratory Tests
  { testName: 'X-Ray Chest PA', description: 'Chest X-ray (posteroanterior)', category: 'X-Ray', price: 500, units: 'Images', referenceRange: 'Clear lung fields, normal cardiac silhouette' },
  { testName: 'X-Ray Chest AP', description: 'Chest X-ray (anteroposterior)', category: 'X-Ray', price: 500, units: 'Images', referenceRange: 'Clear lung fields, normal cardiac silhouette' },
  { testName: 'X-Ray Abdomen', description: 'Abdominal X-ray', category: 'X-Ray', price: 400, units: 'Images', referenceRange: 'No bowel obstruction or abnormal gas patterns' },
  { testName: 'X-Ray Spine (Cervical)', description: 'Cervical spine X-ray', category: 'X-Ray', price: 600, units: 'Images', referenceRange: 'No fractures or alignment abnormalities' },
  { testName: 'X-Ray Spine (Thoracic)', description: 'Thoracic spine X-ray', category: 'X-Ray', price: 600, units: 'Images', referenceRange: 'No fractures or alignment abnormalities' },
  { testName: 'X-Ray Spine (Lumbar)', description: 'Lumbar spine X-ray', category: 'X-Ray', price: 600, units: 'Images', referenceRange: 'No fractures or alignment abnormalities' },
  { testName: 'X-Ray Knee', description: 'Knee X-ray', category: 'X-Ray', price: 500, units: 'Images', referenceRange: 'No fractures or joint space narrowing' },
  { testName: 'X-Ray Ankle', description: 'Ankle X-ray', category: 'X-Ray', price: 500, units: 'Images', referenceRange: 'No fractures or joint abnormalities' },
  { testName: 'X-Ray Wrist', description: 'Wrist X-ray', category: 'X-Ray', price: 500, units: 'Images', referenceRange: 'No fractures or joint abnormalities' },
  { testName: 'X-Ray Hand', description: 'Hand X-ray', category: 'X-Ray', price: 500, units: 'Images', referenceRange: 'No fractures or joint abnormalities' },
  { testName: 'X-Ray Foot', description: 'Foot X-ray', category: 'X-Ray', price: 500, units: 'Images', referenceRange: 'No fractures or joint abnormalities' },
  { testName: 'X-Ray Pelvis', description: 'Pelvic X-ray', category: 'X-Ray', price: 600, units: 'Images', referenceRange: 'No fractures or joint abnormalities' },
  
  // Pathology Laboratory Tests
  { testName: 'Urinalysis (Routine)', description: 'Routine urine examination', category: 'Pathology', price: 200, units: 'N/A', referenceRange: 'Color: Yellow|Appearance: Clear|pH: 4.5-8.0|Specific Gravity: 1.005-1.030|Protein: Negative|Glucose: Negative|Ketones: Negative|Blood: Negative' },
  { testName: 'Stool Routine Examination', description: 'Microscopic and macroscopic stool exam', category: 'Pathology', price: 250, units: 'N/A', referenceRange: 'Color: Brown|Consistency: Formed|Occult Blood: Negative|Ova/Cysts: Not seen' },
  { testName: 'Peripheral Smear', description: 'Morphology of blood cells', category: 'Pathology', price: 300, units: 'N/A', referenceRange: 'Normocytic normochromic RBCs, normal WBC differential, adequate platelets' },
  { testName: 'ESR (Westergren)', description: 'Erythrocyte Sedimentation Rate', category: 'Pathology', price: 150, units: 'mm/hr', referenceRange: 'Males: 0-15 mm/hr|Females: 0-20 mm/hr' },
  
  // Ultrasound Laboratory Tests
  { testName: 'Abdominal Ultrasound (Complete)', description: 'Complete abdominal sonography', category: 'Ultrasound', price: 1200, units: 'Images', referenceRange: 'LIVER:|Size: Normal|Echotexture: Homogeneous|Echogenicity: Normal|Contour: Smooth|LIVER VESSELS:|Portal Vein: Normal caliber|Hepatic Veins: Patent|GALLBLADDER:|Size: Normal|Wall Thickness: <3mm|Contents: Anechoic|PANCREAS:|Size: Normal|Echotexture: Homogeneous|Pancreatic Duct: Normal|SPLEEN:|Size: Normal (8-12 cm)|Echotexture: Homogeneous|KIDNEYS:|Size: Normal (9-12 cm)|Cortical Thickness: Normal|Collecting System: Not dilated|Renal Pelvis: Normal|AORTA:|Diameter: Normal (<3 cm)|No aneurysm' },
  { testName: 'Pelvic Ultrasound', description: 'Transabdominal/Transvaginal pelvic sonography', category: 'Ultrasound', price: 1000, units: 'Images', referenceRange: 'UTERUS:|Size: Normal|Shape: Normal|Myometrium: Homogeneous|Endometrial Thickness: Normal|OVARIES:|Size: Normal (2-3 cm)|Volume: Normal|Follicles: Normal|No cysts or masses|ADNEXA:|No adnexal masses|No free fluid|BLADDER:|Wall Thickness: Normal|No masses|Emptying: Normal' },
  { testName: 'Obstetric Ultrasound (Fetal)', description: 'Pregnancy ultrasound scan', category: 'Ultrasound', price: 1500, units: 'Images', referenceRange: 'GESTATIONAL AGE:|CRL (Crown-Rump Length): Normal for dates|BPD (Biparietal Diameter): Normal for dates|HC (Head Circumference): Normal for dates|AC (Abdominal Circumference): Normal for dates|FL (Femur Length): Normal for dates|FETAL BIOMETRY:|Estimated Fetal Weight: Appropriate for GA|Amniotic Fluid Index: Normal (5-25 cm)|PLACENTA:|Location: Normal|Grade: Appropriate for GA|Thickness: Normal|UMBILICAL CORD:|Number of Vessels: 3 vessels|Doppler: Normal|FETAL ANATOMY:|Head: Normal|Spine: Intact|Heart: 4-chamber view normal|Abdomen: Normal|Limbs: All present' },
  { testName: 'Renal Ultrasound', description: 'Kidney and urinary tract sonography', category: 'Ultrasound', price: 800, units: 'Images', referenceRange: 'RIGHT KIDNEY:|Size: 9-12 cm|Cortical Thickness: 8-12 mm|Echogenicity: Normal|Collecting System: Not dilated|Renal Pelvis: Normal|LEFT KIDNEY:|Size: 9-12 cm|Cortical Thickness: 8-12 mm|Echogenicity: Normal|Collecting System: Not dilated|Renal Pelvis: Normal|BLADDER:|Wall Thickness: <3mm|Post-void Residual: <50ml|No masses|URETERS:|No dilatation' },
  { testName: 'Thyroid Ultrasound', description: 'Thyroid gland sonography', category: 'Ultrasound', price: 900, units: 'Images', referenceRange: 'THYROID GLAND:|Right Lobe: Normal size|Left Lobe: Normal size|Isthmus: Normal thickness|Echotexture: Homogeneous|Echogenicity: Normal|VASCULARITY:|Color Doppler: Normal|No hypervascularity|NODULES:|No nodules or masses|LYMPH NODES:|Cervical nodes: Normal size' },
  { testName: 'Breast Ultrasound', description: 'Breast sonography', category: 'Ultrasound', price: 1100, units: 'Images', referenceRange: 'RIGHT BREAST:|Parenchyma: Homogeneous|Echotexture: Normal|No masses|No calcifications|AXILLA:|Lymph nodes: Normal size|LEFT BREAST:|Parenchyma: Homogeneous|Echotexture: Normal|No masses|No calcifications|AXILLA:|Lymph nodes: Normal size|DOPPLER:|Vascularity: Normal' },
  { testName: 'Transvaginal Ultrasound (TVS)', description: 'Endovaginal pelvic sonography', category: 'Ultrasound', price: 1300, units: 'Images', referenceRange: 'UTERUS:|Size: Normal|Shape: Normal|Myometrium: Homogeneous|Endometrial Thickness: Normal|Endometrial Echo: Normal|OVARIES:|Right Ovary: Normal size|Left Ovary: Normal size|Follicles: Normal|No cysts or masses|ADNEXA:|No adnexal masses|CUL-DE-SAC:|No free fluid' },
  { testName: 'Scrotal Ultrasound', description: 'Testicular and scrotal sonography', category: 'Ultrasound', price: 1000, units: 'Images', referenceRange: 'RIGHT TESTIS:|Size: Normal (4-5 cm)|Echotexture: Homogeneous|No masses|Epididymis: Normal|LEFT TESTIS:|Size: Normal (4-5 cm)|Echotexture: Homogeneous|No masses|Epididymis: Normal|SCROTAL WALL:|Thickness: Normal|No hydrocele|DOPPLER:|Testicular blood flow: Normal' },
  { testName: 'Carotid Doppler Ultrasound', description: 'Carotid artery doppler study', category: 'Ultrasound', price: 1400, units: 'Images', referenceRange: 'RIGHT COMMON CAROTID:|Diameter: Normal|Peak Systolic Velocity: Normal|End Diastolic Velocity: Normal|Plaque: None|Stenosis: <50%|LEFT COMMON CAROTID:|Diameter: Normal|Peak Systolic Velocity: Normal|End Diastolic Velocity: Normal|Plaque: None|Stenosis: <50%|RIGHT INTERNAL CAROTID:|Peak Systolic Velocity: Normal|End Diastolic Velocity: Normal|Resistive Index: Normal|LEFT INTERNAL CAROTID:|Peak Systolic Velocity: Normal|End Diastolic Velocity: Normal|Resistive Index: Normal|VERTEBRAL ARTERIES:|Flow: Normal bilaterally' },
  { testName: 'Lower Limb Doppler (Venous)', description: 'Venous doppler of lower limbs', category: 'Ultrasound', price: 1500, units: 'Images', referenceRange: 'RIGHT LEG:|Common Femoral Vein: Compressible, patent|Superficial Femoral Vein: Compressible, patent|Popliteal Vein: Compressible, patent|Greater Saphenous Vein: Normal|Deep Veins: Patent|LEFT LEG:|Common Femoral Vein: Compressible, patent|Superficial Femoral Vein: Compressible, patent|Popliteal Vein: Compressible, patent|Greater Saphenous Vein: Normal|Deep Veins: Patent|DOPPLER:|Phasic Flow: Present|No reflux|No thrombosis' },
  { testName: 'Upper Limb Doppler (Venous)', description: 'Venous doppler of upper limbs', category: 'Ultrasound', price: 1200, units: 'Images', referenceRange: 'RIGHT ARM:|Subclavian Vein: Patent|Axillary Vein: Patent|Brachial Vein: Patent|Basilic Vein: Normal|Cephalic Vein: Normal|LEFT ARM:|Subclavian Vein: Patent|Axillary Vein: Patent|Brachial Vein: Patent|Basilic Vein: Normal|Cephalic Vein: Normal|DOPPLER:|Phasic Flow: Present|No thrombosis' },
  { testName: 'Liver Doppler Ultrasound', description: 'Hepatic vascular doppler study', category: 'Ultrasound', price: 1400, units: 'Images', referenceRange: 'PORTAL VEIN:|Diameter: Normal (8-12 mm)|Peak Velocity: Normal (15-25 cm/s)|Flow Direction: Hepatopetal|Waveform: Monophasic|HEPATIC ARTERY:|Peak Systolic Velocity: Normal|Resistive Index: 0.5-0.7|HEPATIC VEINS:|Waveform: Triphasic|Flow: Normal|IVC:|Diameter: Normal|Flow: Normal|NO PORTAL HYPERTENSION:|No collateral vessels|No splenomegaly' },
  { testName: 'Prostate Ultrasound (TRUS)', description: 'Transrectal ultrasound of prostate', category: 'Ultrasound', price: 1600, units: 'Images', referenceRange: 'PROSTATE:|Volume: Normal (<30 cc)|Transverse Diameter: Normal|AP Diameter: Normal|Length: Normal|Echotexture: Homogeneous|ZONES:|Peripheral Zone: Normal|Central Zone: Normal|Transition Zone: Normal|SEMINAL VESICLES:|Size: Normal|Echotexture: Normal|NO MASSES:|No focal lesions|No calcifications|BLADDER:|Wall: Normal|No residual urine' },
  { testName: 'Small Parts Ultrasound', description: 'Ultrasound of soft tissues and small parts', category: 'Ultrasound', price: 900, units: 'Images', referenceRange: 'STRUCTURE:|Size: Normal|Echotexture: Homogeneous|Echogenicity: Normal|No masses|No fluid collections|VASCULARITY:|Color Doppler: Normal|No hypervascularity|ADJACENT STRUCTURES:|No abnormalities' },
  { testName: 'Pediatric Abdominal Ultrasound', description: 'Abdominal ultrasound for pediatric patients', category: 'Ultrasound', price: 1100, units: 'Images', referenceRange: 'LIVER:|Size: Age-appropriate|Echotexture: Normal|GALLBLADDER:|Size: Normal|No calculi|PANCREAS:|Size: Normal|Echotexture: Normal|SPLEEN:|Size: Age-appropriate|KIDNEYS:|Size: Age-appropriate|Cortical Thickness: Normal|ADRENAL GLANDS:|Size: Normal|No masses|NO PATHOLOGY:|No masses|No fluid|No organomegaly' },
  
  // Specialized Laboratory Tests
  { testName: 'ECG (Electrocardiogram)', description: '12-lead electrocardiogram', category: 'Cardiology', price: 200, units: 'N/A', referenceRange: 'Normal sinus rhythm, no acute changes' },
  { testName: 'Echocardiogram', description: '2D echocardiography', category: 'Cardiology', price: 1500, units: 'N/A', referenceRange: 'Normal cardiac function and structure' },
  { testName: 'Stress Test', description: 'Exercise stress test', category: 'Cardiology', price: 2000, units: 'N/A', referenceRange: 'No evidence of ischemia' },
  { testName: 'Holter Monitor', description: '24-hour ECG monitoring', category: 'Cardiology', price: 1200, units: 'N/A', referenceRange: 'Normal rhythm throughout monitoring period' },
  { testName: 'Pulmonary Function Test', description: 'Spirometry and lung function', category: 'Pulmonology', price: 800, units: 'L', referenceRange: 'FEV1/FVC >70%, Normal lung volumes' },
  { testName: 'Sleep Study', description: 'Polysomnography', category: 'Sleep Medicine', price: 3000, units: 'N/A', referenceRange: 'No evidence of sleep apnea' },
  { testName: 'Endoscopy', description: 'Upper GI endoscopy', category: 'Gastroenterology', price: 2500, units: 'N/A', referenceRange: 'Normal esophageal, gastric, and duodenal mucosa' },
  { testName: 'Colonoscopy', description: 'Lower GI endoscopy', category: 'Gastroenterology', price: 3000, units: 'N/A', referenceRange: 'Normal colonic mucosa, no polyps or masses' },
];

