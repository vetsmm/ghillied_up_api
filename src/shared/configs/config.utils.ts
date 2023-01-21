export const int = (val: string | undefined, num: number): number =>
    val ? (isNaN(parseInt(val)) ? num : parseInt(val)) : num;
export const bool = (val: string | undefined, bool: boolean): boolean =>
    val == null ? bool : val == 'true';
