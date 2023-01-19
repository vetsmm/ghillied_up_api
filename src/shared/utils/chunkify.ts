// write a converter function that takes in an array of any type and chunks it into an array of arrays of any type

import slice from './slice';
import toInteger from './to-integer';

export function chunkify<T>(array: T[], size = 1): T[][] {
    size = Math.max(toInteger(size), 0);
    const length = array == null ? 0 : array.length;
    if (!length || size < 1) {
        return [];
    }
    let index = 0;
    let resIndex = 0;
    const result = new Array(Math.ceil(length / size));

    while (index < length) {
        result[resIndex++] = slice(array, index, (index += size));
    }
    return result;
}
