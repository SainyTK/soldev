export const truncateString = (str: string) => {
    return str.substring(0, 4) + "..." + str.substring(str.length - 4, str.length)
}