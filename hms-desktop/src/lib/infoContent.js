// Information content database for HMS application
export const infoContent = {
  // Patient Management Module
  patients: {
    title: "Patient Management",
    description: "Manage patient records, medical history, and personal information",
    sections: {
      overview: {
        title: "Patient Overview",
        content: "This module allows you to manage all patient information including personal details, medical history, allergies, and chronic conditions. You can add, edit, view, and search patient records."
      },
      personalInfo: {
        title: "Personal Information",
        content: "Enter the patient's basic personal details including name, age, gender, contact information, and address. This information is required for all patient records."
      },
      medicalHistory: {
        title: "Medical History",
        content: "Record the patient's medical history including past illnesses, surgeries, hospitalizations, and current medications. This helps in providing better healthcare."
      },
      allergies: {
        title: "Allergies",
        content: "Document any known allergies including drug allergies, food allergies, and environmental allergies. This is critical for patient safety during treatment."
      },
      chronicConditions: {
        title: "Chronic Conditions",
        content: "Record any ongoing chronic conditions such as diabetes, hypertension, heart disease, etc. This information helps in long-term care planning."
      },
      emergencyContact: {
        title: "Emergency Contact",
        content: "Provide emergency contact information including name, relationship, and phone number. This is used in case of medical emergencies."
      }
    },
    fields: {
      name: {
        title: "Patient Name",
        content: "Enter the full legal name of the patient as it appears on official documents."
      },
      age: {
        title: "Age",
        content: "Enter the patient's age in years. This helps in determining appropriate treatments and dosages."
      },
      gender: {
        title: "Gender",
        content: "Select the patient's gender. This information is important for medical assessments and treatments."
      },
      phone: {
        title: "Phone Number",
        content: "Enter a valid phone number where the patient can be reached. Include country code if applicable."
      },
      address: {
        title: "Address",
        content: "Enter the complete address including street, city, state, and postal code."
      },
      bloodGroup: {
        title: "Blood Group",
        content: "Select the patient's blood group (A+, A-, B+, B-, AB+, AB-, O+, O-). This is important for blood transfusions and medical procedures."
      }
    }
  },

  // Appointment Management Module
  appointments: {
    title: "Appointment Management",
    description: "Schedule and manage patient appointments with doctors and specialists",
    sections: {
      overview: {
        title: "Appointment Overview",
        content: "This module allows you to schedule, reschedule, and manage patient appointments. You can view appointment calendars, check availability, and send reminders."
      },
      scheduling: {
        title: "Scheduling",
        content: "Schedule new appointments by selecting a patient, doctor, date, and time. The system will check for conflicts and availability."
      },
      calendar: {
        title: "Appointment Calendar",
        content: "View appointments in calendar format. You can see daily, weekly, or monthly views of all scheduled appointments."
      },
      status: {
        title: "Appointment Status",
        content: "Track appointment status including scheduled, confirmed, completed, cancelled, or no-show."
      }
    },
    fields: {
      patient: {
        title: "Patient Selection",
        content: "Select the patient for whom the appointment is being scheduled. You can search by name or patient ID."
      },
      doctor: {
        title: "Doctor Selection",
        content: "Select the doctor or specialist for the appointment. The system will show available time slots."
      },
      date: {
        title: "Appointment Date",
        content: "Select the date for the appointment. Only available dates will be shown."
      },
      time: {
        title: "Appointment Time",
        content: "Select the time slot for the appointment. Standard slots are 30 minutes each."
      },
      reason: {
        title: "Appointment Reason",
        content: "Briefly describe the reason for the appointment (e.g., follow-up, new consultation, routine check-up)."
      }
    }
  },

  // Consultation Management Module
  consultations: {
    title: "Consultation Management",
    description: "Record doctor–patient consultations linked to appointments, including diagnosis and notes",
    sections: {
      overview: {
        title: "Consultation Overview",
        content: "Create a consultation linked to an appointment. Select the patient and doctor, capture the diagnosis, and add clinical notes. Consultations appear in patient history and analytics."
      },
      linkage: {
        title: "Link with Appointment",
        content: "Consultations should be linked to a completed appointment whenever possible. This preserves the visit context and ensures accurate reporting."
      }
    },
    fields: {
      appointmentId: {
        title: "Appointment",
        content: "Choose the appointment this consultation belongs to. The list shows date/time with the patient name."
      },
      patientId: {
        title: "Patient",
        content: "Select the patient being consulted. This determines where the consultation appears in patient history."
      },
      doctorId: {
        title: "Doctor",
        content: "Select the consulting doctor responsible for this encounter."
      },
      diagnosis: {
        title: "Diagnosis",
        content: "Enter the clinical diagnosis for this visit. Use concise medical terminology; this field is required."
      },
      notes: {
        title: "Notes",
        content: "Add any additional clinical notes, observations, or plan. Avoid PHI not needed for care."
      }
    }
  },

  // Prescription Management Module
  prescriptions: {
    title: "Prescription Management",
    description: "Create, manage, and track patient prescriptions and medications",
    sections: {
      overview: {
        title: "Prescription Overview",
        content: "This module allows you to create prescriptions, manage medication orders, track dispensing, and monitor prescription status."
      },
      creation: {
        title: "Creating Prescriptions",
        content: "Create new prescriptions by selecting a patient, adding medications, specifying dosages, and providing instructions."
      },
      medications: {
        title: "Medication Management",
        content: "Add multiple medications to a single prescription. Specify quantity, frequency, duration, and special instructions for each medication."
      },
      safety: {
        title: "Safety Checks",
        content: "The system automatically checks for drug interactions, patient allergies, and contraindications before creating prescriptions."
      },
      dispensing: {
        title: "Prescription Dispensing",
        content: "Track when prescriptions are dispensed, by whom, and update medication inventory accordingly."
      }
    },
    fields: {
      patient: {
        title: "Patient Selection",
        content: "Select the patient for whom the prescription is being created. The system will check for known allergies and medical history."
      },
      medicine: {
        title: "Medicine Selection",
        content: "Search and select medicines from the catalog. The system will show available medicines with current stock levels."
      },
      quantity: {
        title: "Quantity",
        content: "Enter the number of units (tablets, capsules, bottles, etc.) to be dispensed."
      },
      frequency: {
        title: "Frequency",
        content: "Specify how often the medicine should be taken (e.g., once daily, twice daily, three times daily)."
      },
      duration: {
        title: "Duration",
        content: "Enter the number of days the medicine should be taken."
      },
      dosage: {
        title: "Dosage",
        content: "Specify the strength or amount per dose (e.g., 500mg, 10ml)."
      },
      instructions: {
        title: "Instructions",
        content: "Provide specific instructions for taking the medicine (e.g., take with food, avoid alcohol)."
      },
      withFood: {
        title: "Food Timing",
        content: "Specify when the medicine should be taken relative to meals (with meal, before meal, after meal, empty stomach)."
      }
    }
  },

  // Lab Test Management Module
  labTests: {
    title: "Lab Test Management",
    description: "Order, track, and manage laboratory tests and results",
    sections: {
      overview: {
        title: "Lab Test Overview",
        content: "This module allows you to order lab tests, track test progress, record results, and manage test reports."
      },
      ordering: {
        title: "Test Ordering",
        content: "Order lab tests by selecting from the test catalog, specifying patient details, and scheduling collection times."
      },
      results: {
        title: "Test Results",
        content: "Record and manage test results, including normal ranges, abnormal values, and interpretations."
      },
      reports: {
        title: "Test Reports",
        content: "Generate and manage test reports for patients and doctors."
      }
    },
    fields: {
      testType: {
        title: "Test Type",
        content: "Select the type of lab test from the catalog (blood test, urine test, imaging, etc.)."
      },
      patient: {
        title: "Patient",
        content: "Select the patient for whom the test is being ordered."
      },
      doctor: {
        title: "Ordering Doctor",
        content: "Select the doctor who ordered the test."
      },
      priority: {
        title: "Priority",
        content: "Set the priority level (routine, urgent, stat) for the test."
      },
      instructions: {
        title: "Special Instructions",
        content: "Add any special instructions for sample collection or test preparation."
      }
    }
  },

  // Medicine Management Module
  medicines: {
    title: "Medicine Management",
    description: "Manage medicine inventory, stock levels, and suppliers",
    sections: {
      overview: {
        title: "Medicine Overview",
        content: "This module allows you to manage medicine inventory, track stock levels, manage suppliers, and handle medicine transactions."
      },
      inventory: {
        title: "Inventory Management",
        content: "Add new medicines to inventory, update stock levels, and track medicine movements."
      },
      suppliers: {
        title: "Supplier Management",
        content: "Manage medicine suppliers, track orders, and handle procurement."
      },
      stock: {
        title: "Stock Management",
        content: "Monitor stock levels, set low stock alerts, and manage medicine expiry dates."
      }
    },
    fields: {
      name: {
        title: "Medicine Name",
        content: "Enter the brand name or trade name of the medicine."
      },
      genericName: {
        title: "Generic Name",
        content: "Enter the generic or chemical name of the medicine."
      },
      manufacturer: {
        title: "Manufacturer",
        content: "Enter the name of the pharmaceutical company that manufactures the medicine."
      },
      category: {
        title: "Category",
        content: "Select the therapeutic category of the medicine (antibiotic, painkiller, etc.)."
      },
      price: {
        title: "Price",
        content: "Enter the unit price of the medicine for billing purposes."
      },
      quantity: {
        title: "Stock Quantity",
        content: "Enter the current stock quantity available in the pharmacy."
      },
      lowStockThreshold: {
        title: "Low Stock Alert",
        content: "Set the minimum quantity below which low stock alerts will be triggered."
      }
    }
  },

  // Billing Management Module
  billing: {
    title: "Billing Management",
    description: "Handle patient billing, payments, and financial transactions",
    sections: {
      overview: {
        title: "Billing Overview",
        content: "This module allows you to create bills, process payments, track outstanding amounts, and manage financial transactions."
      },
      billCreation: {
        title: "Bill Creation",
        content: "Create bills for consultations, procedures, medicines, and other services provided to patients."
      },
      payments: {
        title: "Payment Processing",
        content: "Process payments through various modes including cash, card, insurance, and online payments."
      },
      reports: {
        title: "Financial Reports",
        content: "Generate financial reports including daily collections, outstanding amounts, and revenue analysis."
      }
    },
    fields: {
      patient: {
        title: "Patient",
        content: "Select the patient for whom the bill is being created."
      },
      services: {
        title: "Services",
        content: "Add services, procedures, or items to the bill with their respective charges."
      },
      paymentMode: {
        title: "Payment Mode",
        content: "Select the payment method (cash, card, insurance, online transfer)."
      },
      amount: {
        title: "Amount",
        content: "Enter the total amount to be charged for the services."
      }
    }
  },

  // IPD Management Module
  ipd: {
    title: "Inpatient Department (IPD)",
    description: "Manage inpatient admissions, bed allocation, and patient care",
    sections: {
      overview: {
        title: "IPD Overview",
        content: "This module manages inpatient admissions, bed allocation, patient care, daily rounds, and discharge processes."
      },
      admissions: {
        title: "Patient Admissions",
        content: "Admit patients to the hospital, assign beds, and create admission records."
      },
      bedManagement: {
        title: "Bed Management",
        content: "Manage hospital beds, track occupancy, and handle bed assignments and transfers."
      },
      care: {
        title: "Patient Care",
        content: "Record daily rounds, vital signs, nursing notes, and treatment progress."
      },
      discharge: {
        title: "Discharge Process",
        content: "Handle patient discharge, generate discharge summaries, and update bed status."
      }
    },
    fields: {
      ward: {
        title: "Ward",
        content: "Select the hospital ward where the patient will be admitted."
      },
      bed: {
        title: "Bed Assignment",
        content: "Assign a specific bed to the patient from available beds in the selected ward."
      },
      admissionType: {
        title: "Admission Type",
        content: "Select the type of admission (emergency, planned, transfer)."
      },
      diagnosis: {
        title: "Admission Diagnosis",
        content: "Enter the primary diagnosis for which the patient is being admitted."
      }
    }
  },

  // User Management Module
  users: {
    title: "User Management",
    description: "Manage system users, roles, and permissions",
    sections: {
      overview: {
        title: "User Overview",
        content: "This module allows you to manage system users, assign roles, set permissions, and control access to different parts of the system."
      },
      roles: {
        title: "Role Management",
        content: "Manage user roles including Admin, Doctor, Nurse, Receptionist, Pharmacy, Lab Technician, etc."
      },
      permissions: {
        title: "Permissions",
        content: "Set specific permissions for each role to control access to different modules and functions."
      },
      security: {
        title: "Security",
        content: "Manage user passwords, account status, and security settings."
      }
    },
    fields: {
      username: {
        title: "Username",
        content: "Enter a unique username for the user. This will be used for login."
      },
      fullName: {
        title: "Full Name",
        content: "Enter the complete name of the user."
      },
      role: {
        title: "Role",
        content: "Select the user role which determines their access permissions in the system."
      },
      isActive: {
        title: "Account Status",
        content: "Enable or disable the user account. Inactive users cannot log in."
      }
    }
  },

  // Dashboard Module
  dashboard: {
    title: "Dashboard",
    description: "Overview of hospital operations and key metrics",
    sections: {
      overview: {
        title: "Dashboard Overview",
        content: "The dashboard provides a comprehensive overview of hospital operations, key metrics, and quick access to important functions."
      },
      metrics: {
        title: "Key Metrics",
        content: "View important metrics including patient count, appointments, prescriptions, revenue, and other operational indicators."
      },
      quickActions: {
        title: "Quick Actions",
        content: "Access frequently used functions like adding new patients, scheduling appointments, or creating prescriptions."
      },
      notifications: {
        title: "Notifications",
        content: "View important notifications, alerts, and reminders for various hospital operations."
      }
    }
  }
};

// Helper function to get information content
export const getInfoContent = (module, section = null, field = null) => {
  if (!infoContent[module]) {
    return {
      title: "Information Not Available",
      content: "No information available for this item."
    };
  }

  if (field && infoContent[module].fields && infoContent[module].fields[field]) {
    return infoContent[module].fields[field];
  }

  if (section && infoContent[module].sections && infoContent[module].sections[section]) {
    return infoContent[module].sections[section];
  }

  return {
    title: infoContent[module].title,
    content: infoContent[module].description
  };
};

// Helper function to get all available modules
export const getAvailableModules = () => {
  return Object.keys(infoContent);
};

// Helper function to get all sections for a module
export const getModuleSections = (module) => {
  if (!infoContent[module] || !infoContent[module].sections) {
    return [];
  }
  return Object.keys(infoContent[module].sections);
};

// Helper function to get all fields for a module
export const getModuleFields = (module) => {
  if (!infoContent[module] || !infoContent[module].fields) {
    return [];
  }
  return Object.keys(infoContent[module].fields);
};
