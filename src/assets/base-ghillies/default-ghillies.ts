import { ServiceBranch } from '@prisma/client';

export type DefaultGhillieType = {
    name: string;
    description: string;
    image: string;
};

export const DEFAULT_GHILLIES: Array<DefaultGhillieType> = [
    {
        name: 'US Army',
        description: 'The Official Ghillie of the US Army!',
        image: 'ARMY.png',
    },
    {
        name: 'US Navy',
        description: 'The Official Ghillie of the US Navy!',
        image: 'NAVY.png',
    },
    {
        name: 'US Air Force',
        description: 'The Official Ghillie of the US Air Force!',
        image: 'AIR_FORCE.png',
    },
    {
        name: 'US Coast Guard',
        description: 'The Official Ghillie of the US Coast Guard!',
        image: 'COAST_GUARD.png',
    },
    {
        name: 'US Marine Corps',
        description: 'The Official Ghillie of the US Marine Corps!',
        image: 'USMC.png',
    },
    {
        name: 'US Space Force',
        description: 'The Official Ghillie of the US Space Force!',
        image: 'SPACE_FORCE.png',
    },
    {
        name: 'US Army National Guard',
        description: 'The Official Ghillie of the US Army National Guard!',
        image: 'ARMY_GUARD.png',
    },
    {
        name: 'US Air National Guard',
        description: 'The Official Ghillie of the US Air National Guard!',
        image: 'AIR_GUARD.png',
    },
    {
        name: 'US National Guard',
        description: 'The Official Ghillie of the US National Guard!',
        image: 'NATIONAL_GUARD.png',
    },
    {
        name: 'Veterans Affairs',
        description:
            'The Official Ghillie of the US Department of Veterans Affairs!',
        image: 'VA.png',
    },
    {
        name: 'Ghillied Up',
        description: 'The Official Ghillie of Ghillied Up!',
        image: 'GHILLIED_UP.png',
    },
    {
        name: 'Military Gamers',
        description:
            'The Official Ghillie of the Military Gamers community. The premier online community dedicated to serving military gamers from all branches of the United States armed forces, both past and present. Join us at militarygamers.com',
        image: 'MILITARY_GAMERS.png',
    },
];

export const getDefaultGhillieForBranch = (branch: ServiceBranch): string => {
    switch (branch) {
        case ServiceBranch.ARMY:
            return DEFAULT_GHILLIES[0].name;
        case ServiceBranch.NAVY:
            return DEFAULT_GHILLIES[1].name;
        case ServiceBranch.AIR_FORCE:
            return DEFAULT_GHILLIES[2].name;
        case ServiceBranch.COAST_GUARD:
            return DEFAULT_GHILLIES[3].name;
        case ServiceBranch.MARINES:
            return DEFAULT_GHILLIES[4].name;
        case ServiceBranch.SPACE_FORCE:
            return DEFAULT_GHILLIES[5].name;
        case ServiceBranch.ARMY_NATIONAL_GUARD:
            return DEFAULT_GHILLIES[6].name;
        case ServiceBranch.AIR_NATIONAL_GUARD:
            return DEFAULT_GHILLIES[7].name;
        default:
            return undefined;
    }
};
