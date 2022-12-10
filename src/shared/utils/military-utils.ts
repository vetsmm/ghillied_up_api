import { ServiceBranch, ServiceStatus } from '@prisma/client';

export const getMilitaryString = (
    branch: ServiceBranch,
    serviceStatus: ServiceStatus,
) => {
    return `${getServiceString(serviceStatus)}${getBranchString(branch)}`;
};

const getServiceString = (serviceStatus: ServiceStatus) => {
    switch (serviceStatus) {
        case ServiceStatus.ACTIVE_DUTY:
            return 'An Active Duty ';
        case ServiceStatus.RESERVE:
            return 'A Reservist ';
        case ServiceStatus.VETERAN:
            return 'A Veteran ';
        case ServiceStatus.NATIONAL_GUARD:
            return 'A National Guard ';
        default:
            return 'A Civilian ';
    }
};

const getBranchString = (branch: ServiceBranch) => {
    switch (branch) {
        case ServiceBranch.ARMY_NATIONAL_GUARD:
        case ServiceBranch.ARMY:
            return 'Soldier';
        case ServiceBranch.NAVY:
            return 'Sailor';
        case ServiceBranch.AIR_NATIONAL_GUARD:
        case ServiceBranch.AIR_FORCE:
            return 'Airman';
        case ServiceBranch.MARINES:
            return 'Marine';
        case ServiceBranch.SPACE_FORCE:
            return 'Guardian';
        case ServiceBranch.COAST_GUARD:
            return 'Coastie';
        default:
            return 'with no services';
    }
};
