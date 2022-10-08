export interface Attribute {
    handle: string;
    name: string;
    value: string;
}

export interface Status {
    group: string;
    subgroups: string[];
    verified: boolean;
}

export interface AuthIdMeUserDetailsDto {
    attributes: Attribute[];
    status: Status[];
}
