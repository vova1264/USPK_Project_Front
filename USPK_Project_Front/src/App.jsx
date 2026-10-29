import { useState, useEffect } from 'react';
import Login from './Views/Account/Login';
import Register from './Views/Account/Register';
import Reset from './Views/Account/Reset';
import Home from './Views/Home/Index';
import Support from './Views/Support/Support';
import Help from './Views/Support/Help';
import Dashboard from './Views/Admin/Dashboard';
import UserList from './Views/Admin/UserList';
import AllNews from './Views/News/AllNews';
import Navbar from './Views/Shared/Navbar';
import Footer from './Views/Shared/Footer';
import NonExistent from './Views/Shared/NonExistent';
import GroupsPage from './Views/Schedule/GroupsPage';
import TeachersPage from './Views/Schedule/TeachersPage';
import ScheduleAdmin from './Views/Schedule/ScheduleAdmin';
import { processDocFile, processWeekDocFile } from './utils/parser';
import { findDocFiles, parseDocMeta, normalizeDocUrl, mapDaysToDates } from './utils/loadDocs';
import { authService } from './Services/authService';
import { userApi } from './Services/userApi';

function App() {
    const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
    const [scheduleData, setScheduleData] = useState({ groups: [], teachers: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // ✅ Получаем view из URL параметра или localStorage
    const [currentView, setCurrentView] = useState(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const viewParam = urlParams.get('view');

        if (viewParam && viewParam !== 'login' && viewParam !== 'register') {
            return viewParam;
        }

        const savedView = localStorage.getItem('currentView');
        if (savedView && savedView !== 'login' && savedView !== 'register') {
            return savedView;
        }

        return authService.getCurrentUser() ? 'home' : 'login';
    });

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    // ✅ Обновляем URL при изменении view
    useEffect(() => {
        if (currentView && currentView !== 'login' && currentView !== 'register') {
            const newUrl = `${window.location.pathname}?view=${currentView}`;
            window.history.pushState({ view: currentView }, '', newUrl);
            localStorage.setItem('currentView', currentView);
        }
    }, [currentView]);

    // ✅ Слушаем изменения URL (кнопки назад/вперед)
    useEffect(() => {
        const handlePopState = () => {
            const urlParams = new URLSearchParams(window.location.search);
            const viewParam = urlParams.get('view');

            if (viewParam && viewParam !== 'login' && viewParam !== 'register') {
                setCurrentView(viewParam);
            } else {
                setCurrentView('home');
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const isAdmin = () => {
        const user = authService.getCurrentUser();
        return user?.role === 'Admin' || user?.role === 'admin';
    };

    // ✅ Загрузка пользователей (только для админки)
    useEffect(() => {
        let isMounted = true;

        const fetchUsers = async () => {
            if (currentView === 'userList' && currentUser && isAdmin()) {
                try {
                    if (isMounted) setLoading(true);
                    const response = await userApi.getUsers();
                    if (isMounted) {
                        setUsers(Array.isArray(response.data) ? response.data : []);
                    }
                } catch (error) {
                    console.error('Ошибка:', error);
                    alert('Не удалось загрузить пользователей');
                    if (isMounted) setUsers([]);
                } finally {
                    if (isMounted) setLoading(false);
                }
            }
        };

        fetchUsers();

        return () => {
            isMounted = false;
        };
    }, [currentView, currentUser]);

    // ✅ ПАРСИНГ РАСПИСАНИЯ (запускается только на вкладках groups/teachers)
    useEffect(() => {
        if (currentView !== 'groups' && currentView !== 'teachers') {
            return;
        }

        const loadAllDocs = async () => {
            setIsLoading(true);
            setError(null);
            // Очищаем старые данные перед новым парсингом
            setScheduleData({ groups: [], teachers: [] });

            try {
                const docFiles = await findDocFiles();
                console.log("📂 Найденные файлы:", docFiles);

                const filteredDocFiles = docFiles.filter((file) => {
                    const fileName = file.Name || file.name;
                    return fileName && !fileName.includes('~$');
                });

                if (filteredDocFiles.length === 0) {
                    setError("Файлы расписания не найдены.");
                    return;
                }

                const allParsedGroups = {};

                for (const file of filteredDocFiles) {
                    const fileName = file.Name || file.name;
                    const fileUrl = normalizeDocUrl(file.Url || file.url, fileName);
                    const meta = parseDocMeta(fileName);

                    try {
                        const response = await fetch(fileUrl);
                        if (!response.ok) throw new Error(`HTTP ${response.status}`);

                        const blob = await response.blob();
                        let parsed = [];

                        if (meta.mode === 'week') {
                            console.log(`📅 Парсинг недели (mammoth): ${fileName}`);
                            // processWeekDocFile теперь возвращает МАССИВ групп (благодаря новому parseWeekly.js)
                            const parsedGroups = await processWeekDocFile(blob);

                            // Применяем даты к ключам дней недели (MONDAY -> "2026-10-26")
                            parsed = parsedGroups.map(group => ({
                                ...group,
                                schedule: mapDaysToDates(group.schedule, meta.range)
                            }));
                        } else {
                            console.log(`📅 Парсинг дня (mammoth): ${fileName}`);
                            // processDocFile возвращает МАССИВ групп
                            parsed = await processDocFile(blob, meta.dateString);
                        }

                        // Слияние с общим списком
                        parsed.forEach((group) => {
                            if (!group.name) return;

                            if (!allParsedGroups[group.name]) {
                                allParsedGroups[group.name] = {
                                    id: group.id,
                                    name: group.name,
                                    schedule: {},
                                };
                            }
                            const target = allParsedGroups[group.name].schedule;

                            // Слияние занятий (защита от дубликатов)
                            Object.entries(group.schedule).forEach(([key, lessons]) => {
                                if (!target[key]) target[key] = [];
                                lessons.forEach((lesson) => {
                                    const exists = target[key].some(
                                        (l) =>
                                            l.time === lesson.time &&
                                            l.subject === lesson.subject &&
                                            l.teacher === lesson.teacher
                                    );
                                    if (!exists) {
                                        target[key].push(lesson);
                                    }
                                });
                            });
                        });
                    } catch (parseError) {
                        console.error(`❌ Ошибка парсинга ${fileName}:`, parseError);
                    }
                }

                const groupsList = Object.values(allParsedGroups);

                // Проверка, что мы спарсили
                console.log('📊 Итоговые группы:', groupsList.map(g => ({
                    name: g.name,
                    keys: Object.keys(g.schedule),
                })));

                // Формируем список преподавателей
                const teachersMap = {};
                groupsList.forEach((group) => {
                    Object.entries(group.schedule).forEach(([key, lessons]) => {
                        lessons.forEach((lesson) => {
                            if (!lesson.teacher || lesson.teacher === 'Не указан' || lesson.teacher === 'Куратор') return;

                            const name = lesson.teacher;
                            if (!teachersMap[name]) {
                                teachersMap[name] = { id: name, name, schedule: {} };
                            }
                            if (!teachersMap[name].schedule[key]) {
                                teachersMap[name].schedule[key] = [];
                            }

                            const exists = teachersMap[name].schedule[key].some(
                                (l) => l.time === lesson.time && l.subject === lesson.subject && l.group === group.name
                            );

                            if (!exists) {
                                teachersMap[name].schedule[key].push({
                                    time: lesson.time,
                                    subject: lesson.subject,
                                    group: group.name,
                                    room: lesson.room,
                                });
                            }
                        });
                    });
                });

                setScheduleData({
                    groups: groupsList,
                    teachers: Object.values(teachersMap),
                });
            } catch (err) {
                console.error("Критическая ошибка:", err);
                setError(err.message || "Не удалось загрузить расписание.");
            } finally {
                setIsLoading(false);
            }
        };

        loadAllDocs();
    }, [currentView]); // Зависимость только от вкладки

    // --- ОБРАБОТЧИКИ СОБЫТИЙ ---

    const updateUrlAndStorage = (view) => {
        if (view && view !== 'login' && view !== 'register') {
            const newUrl = `${window.location.pathname}?view=${view}`;
            window.history.pushState({ view }, '', newUrl);
            localStorage.setItem('currentView', view);
        }
    };

    const handleLogin = () => {
        const user = authService.getCurrentUser();
        setCurrentUser(user);
        setCurrentView('home');
        updateUrlAndStorage('home');
    };

    const handleLogout = () => {
        authService.logout();
        setCurrentUser(null);
        setCurrentView('home');
        setUsers([]);
        localStorage.removeItem('currentView');
        updateUrlAndStorage('home');
    };

    const handleRegister = () => {
        setCurrentView('login');
    };

    const handleNavigate = (view) => {
        setCurrentView(view);
        updateUrlAndStorage(view);
    };

    const handleEditUser = (user) => {
        console.log('Редактирование пользователя:', user);
    };

    const handleDeleteUser = async (user) => {
        if (window.confirm(`Вы уверены, что хотите удалить пользователя ${user.username}?`)) {
            try {
                await userApi.deleteUser(user.id);
                alert(`Пользователь ${user.username} успешно удален`);
                setUsers(prev => prev.filter(u => u.id !== user.id));
            } catch (error) {
                console.error('Ошибка удаления:', error);
                alert('Ошибка при удалении пользователя');
            }
        }
    };

    const handleChangeRole = async (userId, newRole) => {
        try {
            await userApi.changeRole(userId, newRole);
            alert(`Роль пользователя успешно изменена на ${newRole}`);
            setUsers(prev => prev.map(user =>
                user.id === userId ? { ...user, role: newRole } : user
            ));
        } catch (error) {
            console.error('Ошибка смены роли:', error);
            alert('Ошибка при смене роли пользователя');
        }
    };

    // --- РЕНДЕР ---

    if (error && (currentView === 'groups' || currentView === 'teachers')) {
        return (
            <div className="App d-flex flex-column min-vh-100">
                <Navbar currentUser={currentUser} onLogout={handleLogout} onNavigate={handleNavigate} isAdmin={isAdmin()} currentView={currentView} />
                <main className="flex-grow-1 container py-4">
                    <div className="alert alert-warning shadow-sm">
                        <h4><i className="bi bi-exclamation-triangle me-2"></i>Внимание</h4>
                        <p className="mb-0">{error}</p>
                        <hr />
                        <small className="text-muted">
                            Положите .docx файлы в <code>public/docs/</code> и перечислите их в <code>public/docs/docs.json</code>.
                        </small>
                    </div>
                </main>
                <Footer onNavigate={handleNavigate} />
            </div>
        );
    }

    return (
        <div className="App d-flex flex-column min-vh-100">
            <Navbar
                currentUser={currentUser}
                onLogout={handleLogout}
                onNavigate={handleNavigate}
                isAdmin={isAdmin()}
                currentView={currentView}
            />

            <main className="flex-grow-1">
                {isLoading && (currentView === 'groups' || currentView === 'teachers') ? (
                    <div className="d-flex justify-content-center align-items-center vh-100">
                        <div className="text-center">
                            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                                <span className="visually-hidden">Загрузка...</span>
                            </div>
                            <p className="mt-3 text-muted">Парсинг документов...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {currentView === 'home' && <Home onNavigate={handleNavigate} />}
                        {currentView === 'groups' && <GroupsPage data={scheduleData} />}
                        {currentView === 'teachers' && <TeachersPage data={scheduleData} />}
                        {currentView === 'support' && <Support />}
                        {currentView === 'allnews' && <AllNews />}
                        {currentView === 'NonExistent' && <NonExistent />}
                        {currentView === 'help' && <Help onNavigate={handleNavigate} />}
                        {currentView === 'login' && !currentUser && <Login onLogin={handleLogin} onNavigate={handleNavigate} />}
                        {currentView === 'register' && !currentUser && <Register onRegister={handleRegister} />}
                        {currentView === 'Reset' && <Reset onNavigate={handleNavigate} />}
                        {currentView === 'scheduleAdmin' && currentUser && isAdmin() && <ScheduleAdmin />}
                        {currentView === 'dashboard' && currentUser && isAdmin() && <Dashboard />}
                        {currentView === 'userList' && currentUser && isAdmin() && (
                            <UserList
                                users={users}
                                onEdit={handleEditUser}
                                onDelete={handleDeleteUser}
                                onChangeRole={handleChangeRole}
                                isLoading={loading}
                            />
                        )}
                    </>
                )}
            </main>

            <Footer onNavigate={handleNavigate} />
        </div>
    );
}

export default App;