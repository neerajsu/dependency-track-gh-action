export function stripTrailingSlash(str: string) {
    return str.endsWith('/') ? str.slice(0, -1) : str;
}

export function secondsBetweenDates(laterDate: Date, earlierDate: Date) {
    const diff = laterDate.getTime() - earlierDate.getTime();
    return Math.abs(diff / 1000);
}

export async function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}