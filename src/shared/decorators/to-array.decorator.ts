import { Transform } from 'class-transformer';

export function ToArray(): (target: any, key: string) => void {
    return Transform((value: any) => {
        if (value === undefined || value === null) {
            return [];
        }
        if (Array.isArray(value)) {
            return value;
        }
        return [value];
    });
}
