const mongoose = require('mongoose');

const clinicalDecisionSchema = new mongoose.Schema({
  decisionId: {
    type: String,
    required: false,
    unique: true,
    uppercase: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Decision date is required'],
    default: Date.now
  },
  
  // Clinical Assessment
  clinicalAssessment: {
    chiefComplaint: String,
    historyOfPresentIllness: String,
    physicalExamination: {
      generalAppearance: String,
      vitalSigns: {
        bloodPressure: String,
        heartRate: Number,
        temperature: Number,
        respiratoryRate: Number,
        oxygenSaturation: Number
      },
      cardiovascular: String,
      respiratory: String,
      abdominal: String,
      neurological: String,
      musculoskeletal: String,
      skin: String,
      vascularAccess: String
    },
    reviewOfSystems: String
  },
  
  // Diagnosis
  diagnosis: {
    primary: {
      type: String,
      required: true
    },
    secondary: [String],
    icd10Codes: [{
      code: String,
      description: String
    }],
    differentialDiagnosis: [String]
  },
  
  // Treatment Plan
  treatmentPlan: {
    medications: [{
      name: {
        type: String,
        required: true
      },
      dosage: {
        type: String,
        required: true
      },
      frequency: {
        type: String,
        required: true
      },
      duration: String,
      route: {
        type: String,
        enum: ['PO', 'IV', 'IM', 'SC', 'TOPICAL', 'INHALED'],
        required: true
      },
      indication: String,
      startDate: {
        type: Date,
        default: Date.now
      },
      endDate: Date,
      status: {
        type: String,
        enum: ['ACTIVE', 'DISCONTINUED', 'COMPLETED', 'HELD'],
        default: 'ACTIVE'
      },
      prescribedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    
    dialysisPrescription: {
      frequency: {
        type: String,
        enum: ['THRICE_WEEKLY', 'TWICE_WEEKLY', 'DAILY', 'ALTERNATE_DAILY'],
        required: true
      },
      duration: {
        type: Number,
        required: true,
        min: 180, // 3 hours
        max: 480  // 8 hours
      },
      bloodFlowRate: {
        type: Number,
        min: 200,
        max: 500
      },
      dialysateFlowRate: {
        type: Number,
        min: 300,
        max: 800
      },
      ufGoal: {
        type: Number,
        min: 0,
        max: 5
      },
      dialyzer: String,
      anticoagulation: {
        type: String,
        enum: ['HEPARIN', 'CITRATE', 'NONE'],
        default: 'HEPARIN'
      },
      dryWeight: {
        type: Number,
        min: 30,
        max: 200
      },
      modifications: String
    },
    
    proceduresOrdered: [{
      name: String,
      indication: String,
      urgency: {
        type: String,
        enum: ['ROUTINE', 'URGENT', 'EMERGENT'],
        default: 'ROUTINE'
      },
      scheduledDate: Date,
      performedBy: String,
      location: String
    }],
    
    dietaryRestrictions: [{
      nutrient: {
        type: String,
        enum: ['SODIUM', 'POTASSIUM', 'PHOSPHORUS', 'PROTEIN', 'FLUID', 'CALORIES']
      },
      restriction: String,
      rationale: String
    }],
    
    lifestyle: {
      exerciseRecommendations: String,
      smokingCessation: Boolean,
      alcoholRestriction: Boolean,
      weightManagement: String,
      stressManagement: String
    }
  },
  
  // Follow-up Plan
  followUp: {
    nextAppointment: {
      type: Date,
      required: true
    },
    appointmentType: {
      type: String,
      enum: ['ROUTINE', 'URGENT', 'FOLLOW_UP', 'EMERGENCY'],
      default: 'ROUTINE'
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    location: String,
    duration: Number, // in minutes
    purpose: String,
    specialInstructions: String
  },
  
  // Monitoring Plan
  monitoringPlan: {
    vitalSigns: {
      frequency: {
        type: String,
        enum: ['EVERY_SESSION', 'WEEKLY', 'MONTHLY', 'AS_NEEDED'],
        default: 'EVERY_SESSION'
      },
      parameters: [String]
    },
    laboratoryTests: [{
      testName: String,
      frequency: {
        type: String,
        enum: ['WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY', 'AS_NEEDED'],
        default: 'MONTHLY'
      },
      nextDueDate: Date,
      indication: String
    }],
    clinicalAssessments: [{
      assessment: String,
      frequency: String,
      nextDueDate: Date
    }]
  },
  
  // AI Recommendations
  aiRecommendations: {
    suggestions: [{
      type: {
        type: String,
        enum: ['MEDICATION', 'DIALYSIS', 'MONITORING', 'LIFESTYLE', 'INVESTIGATION']
      },
      recommendation: String,
      confidence: {
        type: Number,
        min: 0,
        max: 100
      },
      evidence: String,
      priority: {
        type: String,
        enum: ['HIGH', 'MEDIUM', 'LOW'],
        default: 'MEDIUM'
      }
    }],
    acknowledged: {
      type: Boolean,
      default: false
    },
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    acknowledgedAt: Date,
    overridden: {
      type: Boolean,
      default: false
    },
    overrideReason: String,
    overriddenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    overriddenAt: Date
  },
  
  // Risk Assessment
  riskAssessment: {
    cardiovascularRisk: {
      type: String,
      enum: ['LOW', 'MODERATE', 'HIGH', 'VERY_HIGH']
    },
    mortalityRisk: {
      type: String,
      enum: ['LOW', 'MODERATE', 'HIGH', 'VERY_HIGH']
    },
    hospitalizationRisk: {
      type: String,
      enum: ['LOW', 'MODERATE', 'HIGH', 'VERY_HIGH']
    },
    accessFailureRisk: {
      type: String,
      enum: ['LOW', 'MODERATE', 'HIGH', 'VERY_HIGH']
    },
    infectionRisk: {
      type: String,
      enum: ['LOW', 'MODERATE', 'HIGH', 'VERY_HIGH']
    },
    riskFactors: [String],
    mitigationStrategies: [String]
  },
  
  // Quality Metrics
  qualityMetrics: {
    evidenceBasedCare: {
      type: Boolean,
      default: true
    },
    guidelineAdherence: {
      type: Number,
      min: 0,
      max: 100
    },
    patientSafetyChecks: {
      type: Boolean,
      default: true
    },
    documentationComplete: {
      type: Boolean,
      default: true
    }
  },
  
  // Patient Education
  patientEducation: {
    provided: {
      type: Boolean,
      default: false
    },
    topics: [String],
    materials: [String],
    understanding: {
      type: String,
      enum: ['EXCELLENT', 'GOOD', 'FAIR', 'POOR']
    },
    providedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    providedAt: Date
  },
  
  // Decision Notes
  notes: {
    type: String,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  },
  
  // Status and Approval
  status: {
    type: String,
    enum: ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'IMPLEMENTED', 'MODIFIED', 'CANCELLED'],
    default: 'DRAFT'
  },
  
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  reviewComments: String,
  
  // Implementation tracking
  implementation: {
    implemented: {
      type: Boolean,
      default: false
    },
    implementedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    implementedAt: Date,
    adherence: {
      type: Number,
      min: 0,
      max: 100
    },
    barriers: [String],
    modifications: String
  },
  
  // Outcomes
  outcomes: {
    clinicalOutcomes: [{
      parameter: String,
      baseline: Number,
      target: Number,
      actual: Number,
      timeframe: String,
      achieved: Boolean
    }],
    patientSatisfaction: {
      type: Number,
      min: 1,
      max: 10
    },
    qualityOfLife: {
      type: Number,
      min: 1,
      max: 10
    },
    complications: [String],
    adverseEvents: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
clinicalDecisionSchema.index({ decisionId: 1 });
clinicalDecisionSchema.index({ patient: 1 });
clinicalDecisionSchema.index({ doctor: 1 });
clinicalDecisionSchema.index({ date: 1 });
clinicalDecisionSchema.index({ status: 1 });
clinicalDecisionSchema.index({ patient: 1, date: -1 });

// Generate decision ID
clinicalDecisionSchema.pre('save', function(next) {
  if (!this.decisionId) {
    const date = new Date(this.date);
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.decisionId = `CD${dateStr}${random}`;
  }
  next();
});

module.exports = mongoose.model('ClinicalDecision', clinicalDecisionSchema);
