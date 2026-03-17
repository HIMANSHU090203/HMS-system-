# HMS Catalogs – Reference

This document lists all **catalogs** in the ZenHosp Hospital Management System and the **seed data** loaded by `backend/prisma/seed.ts` from `backend/prisma/seed/catalogData.ts`. Catalogs without seed data are described so you know where they live and how they are populated.

---

## 1. Allergy Catalog

**Model:** `AllergyCatalog`  
**Table:** `allergy_catalog`  
**Fields:** `code` (unique), `name`, `category`, `description` (optional), `isActive`

**Allowed categories:** Food, Drug, Environmental, Chemical, Biological

### Seed data (by category)

#### Food
| Code   | Name |
|--------|------|
| ALG001 | Peanuts |
| ALG002 | Milk |
| ALG003 | Eggs |
| ALG004 | Shellfish |
| ALG005 | Soy |
| ALG006 | Wheat |
| ALG007 | Fish |
| ALG008 | Sesame |
| ALG009 | Tree Nuts |
| ALG010 | Gluten |
| ALG011 | Strawberry |
| ALG012 | Almonds |
| ALG013 | Cashews |
| ALG014 | Walnuts |
| ALG015 | Chocolate |
| ALG016 | Corn |
| ALG017 | Mustard |
| ALG018 | Banana |
| ALG019 | Avocado |
| ALG020 | Kiwi |
| ALG021 | Pineapple |
| ALG022 | Tomato |
| ALG023 | Garlic |
| ALG024 | Onion |
| ALG025 | Peas |
| ALG026 | Lentils |
| ALG027 | Chickpeas |

#### Drug
| Code   | Name |
|--------|------|
| ALG101 | Penicillin |
| ALG102 | Aspirin |
| ALG103 | Sulfonamides |
| ALG104 | Cephalosporins |
| ALG105 | Non-Steroidal Anti-Inflammatory Drugs (NSAIDs) |
| ALG106 | Radiographic Contrast Media |
| ALG107 | Local Anesthetics |
| ALG108 | Opioids |
| ALG109 | Amoxicillin |
| ALG110 | Morphine |
| ALG111 | Ampicillin |
| ALG112 | Codeine |
| ALG113 | Ibuprofen |
| ALG114 | Naproxen |
| ALG116 | Carbamazepine |
| ALG117 | Phenytoin |
| ALG118 | Vancomycin |
| ALG120 | Acetaminophen (Paracetamol) |
| ALG121 | Clindamycin |
| ALG122 | Erythromycin |
| ALG123 | Azithromycin |
| ALG124 | Tetracycline |
| ALG125 | Ciprofloxacin |
| ALG126 | Levofloxacin |
| ALG127 | Gentamicin |
| ALG128 | Metronidazole |
| ALG129 | Insulin |
| ALG130 | Heparin |
| ALG131 | Warfarin |

#### Environmental
| Code   | Name |
|--------|------|
| ALG201 | Dust Mites |
| ALG202 | Pollen |
| ALG203 | Mold |
| ALG204 | Pet Dander |
| ALG205 | Insect Stings |
| ALG206 | Cockroach |
| ALG207 | Dust |
| ALG208 | Grass Pollen |
| ALG209 | Ragweed |
| ALG210 | Smoke |
| ALG211 | Perfume / Fragrance |
| ALG212 | Cold Weather |
| ALG213 | Sunlight |
| ALG214 | Animal Hair |
| ALG215 | Feathers |
| ALG216 | Hay |
| ALG217 | Wood Dust |
| ALG218 | Cigarette Smoke |
| ALG219 | Vehicle Exhaust |
| ALG220 | Humidity |
| ALG221 | Air Pollution |

#### Chemical
| Code   | Name |
|--------|------|
| ALG301 | Latex |
| ALG302 | Nickel |
| ALG303 | Cosmetics |
| ALG304 | Hair Dye |
| ALG305 | Adhesive Tape |
| ALG306 | Rubber |
| ALG307 | Detergents |
| ALG308 | Soap |
| ALG309 | Disinfectants |
| ALG310 | Hand Sanitizers |
| ALG311 | Formaldehyde |
| ALG312 | Metals (General) |
| ALG313 | Cobalt |
| ALG314 | Chromium |

**Total seed count:** 96 allergies

---

## 2. Chronic Condition Catalog

**Model:** `ChronicConditionCatalog`  
**Table:** `chronic_condition_catalog`  
**Fields:** `code` (unique), `name`, `category`, `icdCode` (optional), `description` (optional), `isActive`

### Seed data (by category)

#### Cardiovascular
| Code   | Name | ICD-10 |
|--------|------|--------|
| CHR001 | Hypertension | I10 |
| CHR002 | Coronary Artery Disease | I25.10 |
| CHR003 | Heart Failure | I50.9 |
| CHR004 | Atrial Fibrillation | I48.19 |
| CHR005 | Peripheral Artery Disease | I73.9 |
| CHR006 | Stroke | I64 |
| CHR007 | Angina | I20.9 |
| CHR008 | Cardiomyopathy | I42.9 |
| CHR009 | Valvular Heart Disease | I35.9 |
| CHR010 | Arrhythmia | I49.9 |
| CHR011 | Deep Vein Thrombosis (DVT) | I82.90 |
| CHR012 | Pulmonary Embolism | I26.99 |
| CHR013 | Atherosclerosis | I70.0 |

#### Endocrine
| Code   | Name | ICD-10 |
|--------|------|--------|
| CHR101 | Type 2 Diabetes | E11.9 |
| CHR102 | Type 1 Diabetes | E10.9 |
| CHR103 | Hypothyroidism | E03.9 |
| CHR104 | Hyperthyroidism | E05.90 |
| CHR105 | Obesity | E66.9 |
| CHR106 | Hyperlipidemia | E78.5 |
| CHR107 | Metabolic Syndrome | E88.81 |
| CHR108 | Prediabetes | R73.03 |
| CHR109 | Polycystic Ovary Syndrome (PCOS) | E28.2 |
| CHR110 | Cushing Syndrome | E24.9 |
| CHR111 | Addison Disease | E27.1 |
| CHR112 | Acromegaly | E22.0 |
| CHR113 | Hyperparathyroidism | E21.1 |
| CHR114 | Hypoparathyroidism | E20.9 |

#### Respiratory
| Code   | Name | ICD-10 |
|--------|------|--------|
| CHR201 | Asthma | J45.90 |
| CHR202 | Chronic Obstructive Pulmonary Disease (COPD) | J44.9 |
| CHR203 | Chronic Bronchitis | J42 |
| CHR204 | Sleep Apnea | G47.33 |
| CHR205 | Chronic Sinusitis | J32.9 |
| CHR206 | Pulmonary Hypertension | I27.2 |
| CHR207 | Interstitial Lung Disease | J84.9 |
| CHR208 | Bronchiectasis | J47.9 |
| CHR209 | Allergic Rhinitis | J30.9 |
| CHR210 | Emphysema | J43.9 |
| CHR211 | Tuberculosis (Chronic) | B90.9 |

#### Gastrointestinal
| Code   | Name | ICD-10 |
|--------|------|--------|
| CHR301 | Gastroesophageal Reflux Disease (GERD) | K21.9 |
| CHR302 | Irritable Bowel Syndrome (IBS) | K58.9 |
| CHR303 | Inflammatory Bowel Disease | K50.90 |
| CHR304 | Chronic Liver Disease | K73.9 |
| CHR305 | Celiac Disease | K90.0 |
| CHR306 | Chronic Pancreatitis | K86.1 |
| CHR307 | Fatty Liver Disease | K76.0 |
| CHR308 | Crohn Disease | K50.90 |
| CHR309 | Ulcerative Colitis | K51.90 |
| CHR310 | Peptic Ulcer Disease | K27.9 |
| CHR311 | Diverticulitis | K57.30 |

#### Neurological
| Code   | Name | ICD-10 |
|--------|------|--------|
| CHR401 | Epilepsy | G40.909 |
| CHR402 | Parkinson Disease | G20 |
| CHR403 | Multiple Sclerosis | G35 |
| CHR404 | Migraine | G43.909 |
| CHR405 | Alzheimer Disease | G30.9 |
| CHR406 | Dementia | F03.90 |
| CHR407 | Neuropathy | G62.9 |
| CHR408 | Restless Leg Syndrome | G25.81 |
| CHR409 | Bell's Palsy | G51.0 |
| CHR410 | Essential Tremor | G25.0 |
| CHR411 | Myasthenia Gravis | G70.00 |
| CHR412 | Amyotrophic Lateral Sclerosis (ALS) | G12.21 |

#### Musculoskeletal
| Code   | Name | ICD-10 |
|--------|------|--------|
| CHR501 | Osteoarthritis | M17.9 |
| CHR502 | Rheumatoid Arthritis | M06.9 |
| CHR503 | Osteoporosis | M81.0 |
| CHR504 | Degenerative Disc Disease | M51.36 |
| CHR505 | Fibromyalgia | M79.7 |
| CHR506 | Gout | M10.9 |
| CHR507 | Ankylosing Spondylitis | M45.9 |
| CHR508 | Psoriatic Arthritis | L40.54 |
| CHR509 | Scoliosis | M41.9 |
| CHR510 | Spinal Stenosis | M48.00 |

#### Renal
| Code   | Name | ICD-10 |
|--------|------|--------|
| CHR601 | Chronic Kidney Disease (CKD) | N18.9 |
| CHR602 | Kidney Stones | N20.0 |
| CHR603 | Nephrotic Syndrome | N04.9 |
| CHR604 | Polycystic Kidney Disease | N28.1 |
| CHR605 | Glomerulonephritis | N05.9 |
| CHR606 | Renal Failure (Chronic) | N18.6 |

#### Mental health
| Code   | Name | ICD-10 |
|--------|------|--------|
| CHR701 | Depression | F32.9 |
| CHR702 | Anxiety Disorder | F41.9 |
| CHR703 | Bipolar Disorder | F31.9 |
| CHR704 | Schizophrenia | F20.9 |
| CHR705 | Post-Traumatic Stress Disorder (PTSD) | F43.10 |
| CHR706 | Obsessive Compulsive Disorder (OCD) | F42 |
| CHR707 | Attention Deficit Hyperactivity Disorder (ADHD) | F90.9 |
| CHR708 | Autism Spectrum Disorder | F84.0 |

#### Oncology
| Code   | Name | ICD-10 |
|--------|------|--------|
| CHR801 | Breast Cancer | C50.919 |
| CHR802 | Lung Cancer | C34.90 |
| CHR803 | Prostate Cancer | C61 |
| CHR804 | Colon Cancer | C18.9 |

**Total seed count:** 84 chronic conditions

---

## 3. Diagnosis Catalog

**Model:** `DiagnosisCatalog`  
**Table:** `diagnosis_catalog`  
**Fields:** `icdCode` (unique), `name`, `category`, `isActive`

### Seed data

| ICD Code | Name | Category |
|----------|------|----------|
| J00 | Common Cold | Acute Respiratory |
| J06.9 | Upper Respiratory Tract Infection | Acute Respiratory |
| K59.0 | Constipation | Gastrointestinal |
| R51 | Headache | Neurological |
| M79.3 | Muscle Pain (Myalgia) | Musculoskeletal |
| N30.0 | Acute Cystitis | Genitourinary |
| E11.9 | Type 2 Diabetes Without Complications | Endocrine |
| I10 | Essential Hypertension | Cardiovascular |
| J45.9 | Asthma Unspecified | Respiratory |
| A09 | Infectious Gastroenteritis | Infectious Disease |
| J18.9 | Pneumonia | Infectious Disease |
| N39.0 | Urinary Tract Infection | Genitourinary |

**Total seed count:** 12 diagnoses

---

## 4. Medicine Catalog

**Model:** `MedicineCatalog`  
**Table:** `medicine_catalog`  
**Fields:** `code` (unique), `name`, `genericName`, `manufacturer`, `category`, `therapeuticClass`, `atcCode`, `price`, `stockQuantity`, `lowStockThreshold`, `expiryDate`, `isActive`, `hospitalId` (optional)

### Seed data

#### Analgesics
| Code   | Name | Generic | Category | Therapeutic Class | ATC | Price (INR) |
|--------|------|----------|----------|--------------------|-----|-------------|
| MED001 | Paracetamol | Acetaminophen | Analgesic | NSAID | N02BE01 | 0.50 |
| MED002 | Ibuprofen | Ibuprofen | Analgesic | NSAID | M01AE01 | 0.75 |
| MED003 | Diclofenac | Diclofenac Sodium | Analgesic | NSAID | M01AB05 | 0.80 |

#### Antibiotics
| Code   | Name | Generic | Category | Therapeutic Class | ATC | Price (INR) |
|--------|------|----------|----------|--------------------|-----|-------------|
| MED101 | Amoxicillin | Amoxicillin | Antibiotic | Penicillin | J01CA04 | 2.50 |
| MED102 | Azithromycin | Azithromycin | Antibiotic | Macrolide | J01FA10 | 5.00 |
| MED103 | Ciprofloxacin | Ciprofloxacin | Antibiotic | Fluoroquinolone | J01MA02 | 3.00 |
| MED104 | Cefixime | Cefixime | Antibiotic | Cephalosporin | J01DD08 | 8.00 |

#### Antacids
| Code   | Name | Generic | Category | Therapeutic Class | ATC | Price (INR) |
|--------|------|----------|----------|--------------------|-----|-------------|
| MED201 | Omeprazole | Omeprazole | Antacid | Proton Pump Inhibitor | A02BC01 | 1.50 |
| MED202 | Pantoprazole | Pantoprazole | Antacid | Proton Pump Inhibitor | A02BC02 | 1.60 |

#### Antihypertensives
| Code   | Name | Generic | Category | Therapeutic Class | ATC | Price (INR) |
|--------|------|----------|----------|--------------------|-----|-------------|
| MED301 | Amlodipine | Amlodipine Besylate | Antihypertensive | Calcium Channel Blocker | C08CA01 | 3.50 |
| MED302 | Losartan | Losartan Potassium | Antihypertensive | ARB | C09CA01 | 4.00 |

#### Antidiabetics
| Code   | Name | Generic | Category | Therapeutic Class | ATC | Price (INR) |
|--------|------|----------|----------|--------------------|-----|-------------|
| MED401 | Metformin | Metformin HCl | Antidiabetic | Biguanide | A10BA02 | 2.00 |
| MED402 | Glibenclamide | Glibenclamide | Antidiabetic | Sulfonylurea | A10BB01 | 1.80 |

**Total seed count:** 14 medicines (all manufacturer: Generic)

---

## 5. Lab Test Catalog (Test Catalog)

**Model:** `TestCatalog`  
**Table:** `test_catalog`  
**Fields:** `testName` (unique), `description`, `category`, `price`, `units`, `referenceRange`, `isActive`

Seed is applied with upsert by `testName`; duplicate names in the seed list overwrite earlier entries.

### Seed data (by category)

#### General
| Test Name | Description | Price (INR) | Units |
|-----------|-------------|-------------|-------|
| CBC (Complete Blood Count) | Complete blood count with differential | 150 | N/A |
| LFT (Liver Function Test) | Liver function panel | 200 | U/L |
| KFT (Kidney Function Test) | Kidney function panel | 180 | mg/dL |
| Blood Sugar (Fasting) | Fasting blood glucose | 80 | mg/dL |
| Blood Sugar (Random) | Random blood glucose | 80 | mg/dL |
| HbA1c | Glycated hemoglobin | 300 | % |
| Lipid Profile | Complete lipid panel | 250 | mg/dL |
| Thyroid Function Test (TFT) | Thyroid hormone panel | 400 | mIU/L |
| Urine Routine | Complete urinalysis | 120 | N/A |
| Stool Routine | Stool examination | 100 | N/A |
| ESR (Erythrocyte Sedimentation Rate) | Sedimentation rate | 80 | mm/hr |
| CRP (C-Reactive Protein) | Inflammation marker | 200 | mg/L |
| Vitamin B12 | Vitamin B12 level | 500 | pg/mL |
| Vitamin D | 25-Hydroxyvitamin D | 600 | ng/mL |
| Iron Studies | Iron profile | 350 | μg/dL |

#### Biochemistry
| Test Name | Description | Price (INR) |
|-----------|-------------|-------------|
| Liver Function Test (LFT) | Comprehensive liver panel | 600 |
| Kidney Function Test (KFT) | Renal panel | 550 |
| Lipid Profile | Lipid panel | 500 |
| Thyroid Profile (T3, T4, TSH) | Thyroid function tests | 650 |

#### Endocrinology
- Thyroid Profile (T3, T4, TSH) — see Biochemistry

#### Pathology
| Test Name | Description | Price (INR) |
|-----------|-------------|-------------|
| Urinalysis (Routine) | Routine urine examination | 200 |
| Stool Routine Examination | Microscopic and macroscopic stool exam | 250 |
| Peripheral Smear | Morphology of blood cells | 300 |
| ESR (Westergren) | Erythrocyte Sedimentation Rate | 150 |

#### MRI
| Test Name | Description | Price (INR) |
|-----------|-------------|-------------|
| MRI Brain | Magnetic resonance imaging of brain | 5000 |
| MRI Spine (Cervical) | MRI of cervical spine | 6000 |
| MRI Spine (Thoracic) | MRI of thoracic spine | 6000 |
| MRI Spine (Lumbar) | MRI of lumbar spine | 6000 |
| MRI Knee | MRI of knee joint | 4500 |
| MRI Shoulder | MRI of shoulder joint | 4500 |
| MRI Abdomen | MRI of abdomen and pelvis | 7000 |
| MRI Heart | Cardiac MRI | 8000 |

#### CT Scan
| Test Name | Description | Price (INR) |
|-----------|-------------|-------------|
| CT Head | Computed tomography of head | 3000 |
| CT Chest | CT scan of chest | 3500 |
| CT Abdomen | CT scan of abdomen | 4000 |
| CT Pelvis | CT scan of pelvis | 3500 |
| CT Spine (Cervical / Thoracic / Lumbar) | CT of spine | 3000 each |
| CT Angiography | CT angiogram | 5000 |

#### X-Ray
| Test Name | Description | Price (INR) |
|-----------|-------------|-------------|
| X-Ray Chest PA / AP | Chest X-ray | 500 |
| X-Ray Abdomen | Abdominal X-ray | 400 |
| X-Ray Spine (Cervical / Thoracic / Lumbar) | Spine X-ray | 600 each |
| X-Ray Knee / Ankle / Wrist / Hand / Foot | Limb X-ray | 500 each |
| X-Ray Pelvis | Pelvic X-ray | 600 |

#### Ultrasound
| Test Name | Description | Price (INR) |
|-----------|-------------|-------------|
| Abdominal Ultrasound (Complete) | Complete abdominal sonography | 1200 |
| Pelvic Ultrasound | Transabdominal/Transvaginal pelvic sonography | 1000 |
| Obstetric Ultrasound (Fetal) | Pregnancy ultrasound scan | 1500 |
| Renal Ultrasound | Kidney and urinary tract sonography | 800 |
| Thyroid Ultrasound | Thyroid gland sonography | 900 |
| Breast Ultrasound | Breast sonography | 1100 |
| Transvaginal Ultrasound (TVS) | Endovaginal pelvic sonography | 1300 |
| Scrotal Ultrasound | Testicular and scrotal sonography | 1000 |
| Carotid Doppler Ultrasound | Carotid artery doppler study | 1400 |
| Lower Limb Doppler (Venous) | Venous doppler of lower limbs | 1500 |
| Upper Limb Doppler (Venous) | Venous doppler of upper limbs | 1200 |
| Liver Doppler Ultrasound | Hepatic vascular doppler study | 1400 |
| Prostate Ultrasound (TRUS) | Transrectal ultrasound of prostate | 1600 |
| Small Parts Ultrasound | Soft tissues and small parts | 900 |
| Pediatric Abdominal Ultrasound | Abdominal ultrasound for pediatric patients | 1100 |

#### Cardiology
| Test Name | Description | Price (INR) |
|-----------|-------------|-------------|
| ECG (Electrocardiogram) | 12-lead electrocardiogram | 200 |
| Echocardiogram | 2D echocardiography | 1500 |
| Stress Test | Exercise stress test | 2000 |
| Holter Monitor | 24-hour ECG monitoring | 1200 |

#### Other specialties
| Test Name | Category | Price (INR) |
|-----------|----------|-------------|
| Pulmonary Function Test | Pulmonology | 800 |
| Sleep Study | Sleep Medicine | 3000 |
| Endoscopy | Gastroenterology | 2500 |
| Colonoscopy | Gastroenterology | 3000 |

**Source:** `backend/prisma/seed/catalogData.ts` — `labTestCatalogData`. Some test names appear more than once; the seed upserts by `testName`, so the last occurrence wins.

---

## 6. Procedure Catalog (OT)

**Model:** `ProcedureCatalog`  
**Table:** `procedure_catalog`  
**Fields:** `code` (unique), `name`, `category`, `defaultDuration` (minutes, optional), `isActive`

**Seed data:** None. Procedures are added and edited via the API (`/api/procedure-catalog`) and the OT module in the app (e.g. surgery scheduling). No default list is seeded.

**Example categories (for reference):** General Surgery, Orthopedic, Cardiac, etc.

---

## 7. Drug Interaction Catalog

**Model:** `DrugInteraction`  
**Table:** `drug_interactions`  
**Fields:** `medicine1Id`, `medicine2Id`, `interactionType`, `description`, `clinicalEffect`, `management`, `severity`, `isActive`

This is a **relationship catalog** between two medicines in `MedicineCatalog`. There is **no seed data** in `catalogData.ts`. Interactions are expected to be added via the safety/clinical features (e.g. prescription or pharmacy workflows) or admin tools that call the relevant API.

---

## Summary

| Catalog | Table | Seeded | Seed count (approx.) |
|---------|--------|--------|----------------------|
| Allergy | allergy_catalog | Yes | 96 |
| Chronic Condition | chronic_condition_catalog | Yes | 84 |
| Diagnosis | diagnosis_catalog | Yes | 12 |
| Medicine | medicine_catalog | Yes | 14 |
| Lab Test | test_catalog | Yes | 70+ (see seed file for exact list) |
| Procedure | procedure_catalog | No | — |
| Drug Interaction | drug_interactions | No | — |

**Seed script:** `backend/prisma/seed.ts`  
**Seed data file:** `backend/prisma/seed/catalogData.ts`  
**Run seed:** `npm run backend:seed` (from repo root) or `npx prisma db seed` from `backend/`.
