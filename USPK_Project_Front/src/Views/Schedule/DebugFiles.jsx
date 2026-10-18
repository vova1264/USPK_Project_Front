const DebugFiles = () => {
    // Пытаемся найти файлы в разных папках, чтобы понять, где они лежат
    const docsInData = import.meta.glob('../data/docs/*.doc', { query: '?url', import: 'default', eager: true });
    const docsInSrc = import.meta.glob('../*.doc', { query: '?url', import: 'default', eager: true });
    const docsInPublic = import.meta.glob('/docs/*.doc', { query: '?url', import: 'default', eager: true });

    const docxInData = import.meta.glob('../data/docs/*.docx', { query: '?url', import: 'default', eager: true });

    return (
        <div className="card shadow-sm mb-4 border-warning">
            <div className="card-header bg-warning text-dark">
                <strong>🔍 Диагностика: Поиск файлов</strong>
            </div>
            <div className="card-body">
                <h6>Файлы в <code>src/data/docs/*.doc</code>:</h6>
                <pre className="bg-light p-2 border">{JSON.stringify(Object.keys(docsInData), null, 2)}</pre>

                <h6>Файлы в <code>src/data/docs/*.docx</code>:</h6>
                <pre className="bg-light p-2 border">{JSON.stringify(Object.keys(docxInData), null, 2)}</pre>

                <h6>Файлы в <code>src/*.doc</code>:</h6>
                <pre className="bg-light p-2 border">{JSON.stringify(Object.keys(docsInSrc), null, 2)}</pre>

                <h6>Файлы в <code>public/docs/*.doc</code>:</h6>
                <pre className="bg-light p-2 border">{JSON.stringify(Object.keys(docsInPublic), null, 2)}</pre>
            </div>
        </div>
    );
};

export default DebugFiles;