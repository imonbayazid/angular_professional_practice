import { Routes, RouterModule } from '@angular/router';
import {HomeComponent} from './home/home.component';
import {CONSTANTS} from './shared/constant';


export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' }, 

      //ManualAdjustment
    { path: 'medicaid/manualAdjustment', loadChildren: 'app/medicaid/ManualAdjustments/ManualAdjustment.module', data: { agencyType: CONSTANTS.MED_AGENCY_TYPE } },  
    { path: 'medicare/manualAdjustment', loadChildren: 'app/medicaid/ManualAdjustments/ManualAdjustment.module', data: { agencyType: CONSTANTS.MEDICARE_AGENCY_TYPE } },
    { path: 'va/manualAdjustment', loadChildren: 'app/medicaid/ManualAdjustments/ManualAdjustment.module', data: { agencyType: CONSTANTS.VA_AGENCY_TYPE } },
    

    // Matrix Definition
    { path: 'medicaid/matrixdefinition', loadChildren: 'app/medicaid/MatrixDefinition/MatrixDefinition.module', data: { agency: CONSTANTS.MED_AGENCY_TYPE}},
    { path: 'medicare/matrixdefinition', loadChildren: 'app/medicaid/MatrixDefinition/MatrixDefinition.module', data: { agency: CONSTANTS.MEDICARE_AGENCY_TYPE }},
    { path: 'va/matrixdefinition', loadChildren: 'app/medicaid/MatrixDefinition/MatrixDefinition.module', data: { agency: CONSTANTS.VA_AGENCY_TYPE}},

    { path: 'medicaid/transmitDecline', loadChildren: 'app/medicaid/TransmitDecline/TransmitDecline.module', data: { agency: CONSTANTS.MED_AGENCY_TYPE } },
    // Setup Profile
    { path: 'medicaid/setupProfile', loadChildren: 'app/medicaid/setupProfile/SetupProfile.module', data: { agencyType: CONSTANTS.MED_AGENCY_TYPE } },
    { path: 'medicare/setupProfile', loadChildren: 'app/medicaid/setupProfile/SetupProfile.module', data: { agencyType: CONSTANTS.MEDICARE_AGENCY_TYPE } },
    { path: 'va/setupProfile', loadChildren: 'app/medicaid/setupProfile/SetupProfile.module', data: { agencyType: CONSTANTS.VA_AGENCY_TYPE } },


    { path: 'medicaid/supergroupDefinition', loadChildren: 'app/medicaid/SupergroupDefinition/SupergroupDefinition.module' },
    { path: 'medicare/supergroupDefinition', loadChildren: 'app/medicare/SupergroupDefinition/SupergroupDefinition.module' },

    { path: 'veteranAffairs/supergroupDefinition', loadChildren: 'app/VeteranAffairs/SupergroupDefinition/SupergroupDefinition.module' },

    { path: 'home', loadChildren: 'app/home/home.module' },
    { path: 'medicaid/calculatePrices', loadChildren: 'app/medicaid/CalculatePrices/CalculatePrices.module', data: { agencyType: CONSTANTS.MED_AGENCY_TYPE } },
    { path: 'medicaid/approveMatrixChanges', loadChildren: 'app/medicaid/ApproveMatrixChanges/ApproveMatrixChanges.module', data: { agencyType: CONSTANTS.MED_AGENCY_TYPE } },
    { path: 'medicaid/createSubmission', loadChildren: 'app/medicaid/CreateSubmission/create-submission.module' },
   
	{ path: 'medicaid/stateTransmission', loadChildren: 'app/medicaid/StateTransmission/StateTransmission.module' },
	
    { path: 'medicare/submission', loadChildren: 'app/medicare/Submission/Submission.module', data: { agencyType: CONSTANTS.MEDICARE_AGENCY_TYPE } },
    { path: 'medicare/approveMatrixChanges', loadChildren: 'app/medicare/ApproveMatrixChanges/ApproveMatrixChanges.module', data: { agencyType: CONSTANTS.MEDICARE_AGENCY_TYPE } },
    { path: 'veteranAffairs/approvePrices', loadChildren: 'app/VeteranAffairs/ApprovePrices/ApprovePrices.module' },
    { path: 'veteranAffairs/approveMatrixChanges', loadChildren: 'app/medicare/ApproveMatrixChanges/ApproveMatrixChanges.module', data: { agencyType: CONSTANTS.VA_AGENCY_TYPE } },
    { path: 'veteranAffairs/setupTransmission', loadChildren: 'app/VeteranAffairs/SetupTransmission/SetupTransmission.module' },
    { path: 'veteranAffairs/calculatePrices', loadChildren: 'app/medicaid/CalculatePrices/CalculatePrices.module', data: { agencyType: CONSTANTS.VA_AGENCY_TYPE } },
    { path: 'veteranAffairs/coc', loadChildren: 'app/VeteranAffairs/COC/Coc.module' },

    { path: 'dataMaintenance/programValidation', loadChildren: 'app/DataMaintenance/ProgramValidation/ProgramValidation.module' },
    { path: 'dataMaintenance/programReimbursement', loadChildren: 'app/DataMaintenance/ProgramReimbursement/ProgramReimbursement.module' },
    { path: 'dataMaintenance/ineligibilityReason', loadChildren: 'app/DataMaintenance/IneligibilityReason/IneligibilityReason.module' },
    { path: 'utilization/claimStatusReport', loadChildren: 'app/Utilization/ClaimStatusReport/ClaimStatusReport.module' },

    
];

export const routing = RouterModule.forRoot(routes);