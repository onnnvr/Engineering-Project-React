export default function convertDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).toString().padStart(2, '0');
    const day = String(d.getDate()).toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}