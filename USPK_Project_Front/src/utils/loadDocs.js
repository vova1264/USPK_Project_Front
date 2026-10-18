// // src/utils/loadDocs.js

// // Этот файл находится в src/utils/,
// // поэтому путь ../data/docs/ корректен:
// // выйти из utils, зайти в data/docs
// export const findDocFiles = () => {
//     return import.meta.glob(
//         ['../data/docs/*.doc', '../data/docs/*.docx'],
//         { query: '?url', import: 'default', eager: true }
//     );
// };

export const findDocFiles = async () => {
    const res = await fetch('/docs/docs.json');
    if (!res.ok) throw new Error(`Не удалось загрузить /docs/docs.json (${res.status})`);
    return await res.json(); // [{ name, url }]
};