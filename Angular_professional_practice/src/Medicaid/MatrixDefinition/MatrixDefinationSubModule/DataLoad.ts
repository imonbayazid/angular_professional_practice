
export interface DataLoad{
    onDemand();
    dataLoaded: boolean;
    updatePending: boolean;
    save();
    profileChanged?: () => void;
    refreshData();
}