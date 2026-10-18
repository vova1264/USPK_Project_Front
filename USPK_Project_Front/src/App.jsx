import { useState, useEffect } from 'react';
import Login from './Views/Account/Login';
import Register from './Views/Account/Register';
import Home from './Views/Home/Index';
import Support from './Views/Support/Support';
import Help from './Views/Support/Help';
import Dashboard from './Views/Admin/Dashboard';
import UserList from './Views/Admin/UserList';
import Navbar from './Views/Shared/Navbar';
import Footer from './Views/Shared/Footer';
import GroupsPage from './Views/Schedule/GroupsPage';
import TeachersPage from './Views/Schedule/TeachersPage';
import { processDocFile } from './utils/parser';
import { findDocFiles } from './utils/loadDocs';
import { authService } from './Services/authService';
import { userApi } from './Services/userApi';

// Функция для извлечения даты из имени файла
const extractDateFromFilename = (filename) => {
    const match = filename.match(/(\d{2})\.(\d{2})\.(\d{2,4})/);
    if (match) {
        let [, day, month, year] = match;
        if (year.length === 2) {
            year = `20${year}`;
        }
        return `${year}-${month}-${day}`;
    }
    return new Date().toISOString().split('T')[0];
};

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
        // Не запускаем парсинг, если мы не на вкладках расписания
        if (currentView !== 'groups' && currentView !== 'teachers') {
            return;
        }

        // Если данные уже загружены, повторно не парсим
        if (scheduleData.groups.length > 0) {
            return;
        }

        const loadAllDocs = async () => {
            setIsLoading(true);
            try {
                const docFiles = await findDocFiles();
                console.log("Найденные файлы:", docFiles);

                const filteredDocFiles = docFiles.filter(({ name }) => {
                    return !name.startsWith('~$') && !name.includes('~$');
                });

                if (filteredDocFiles.length === 0) {
                    setError("Файлы расписания не найдены. Проверьте public/docs/docs.json.");
                    setIsLoading(false);
                    return;
                }

                let allParsedGroups = {};

                for (const { name, url } of filteredDocFiles) {
                    console.log("▶ Обработка файла:", name);
                    const dateString = extractDateFromFilename(name);

                    try {
                        const response = await fetch(url);
                        if (!response.ok) {
                            throw new Error(`HTTP ${response.status} по ${url}`);
                        }
                        const blob = await response.blob();
                        const parsed = await processDocFile(blob, dateString);
                        console.log("  ✅ parsed:", parsed);

                        parsed.forEach(group => {
                            if (!allParsedGroups[group.name]) {
                                allParsedGroups[group.name] = {
                                    id: group.id,
                                    name: group.name,
                                    schedule: { ...group.schedule }
                                };
                            } else {
                                Object.entries(group.schedule).forEach(([date, lessons]) => {
                                    if (!allParsedGroups[group.name].schedule[date]) {
                                        allParsedGroups[group.name].schedule[date] = [];
                                    }
                                    lessons.forEach(lesson => {
                                        const exists = allParsedGroups[group.name].schedule[date].some(
                                            l => l.time === lesson.time
                                                && l.subject === lesson.subject
                                                && l.teacher === lesson.teacher
                                                && l.room === lesson.room
                                        );
                                        if (!exists) {
                                            allParsedGroups[group.name].schedule[date].push(lesson);
                                        }
                                    });
                                });
                            }
                        });

                    } catch (parseError) {
                        console.error(`  ❌ Ошибка парсинга ${name}:`, parseError);
                    }
                }

                // Формируем список преподавателей
                const teachersMap = {};
                const groupsList = Object.values(allParsedGroups);

                groupsList.forEach(group => {
                    Object.entries(group.schedule).forEach(([date, lessons]) => {
                        lessons.forEach(lesson => {
                            if (!lesson.teacher || lesson.teacher === 'Не указан' || lesson.teacher === 'Куратор') return;

                            const name = lesson.teacher;

                            if (!teachersMap[name]) {
                                teachersMap[name] = {
                                    id: name,
                                    name: name,
                                    schedule: {}
                                };
                            }

                            if (!teachersMap[name].schedule[date]) {
                                teachersMap[name].schedule[date] = [];
                            }

                            const exists = teachersMap[name].schedule[date].some(
                                l => l.time === lesson.time
                                    && l.subject === lesson.subject
                                    && l.group === group.name
                            );

                            if (!exists) {
                                teachersMap[name].schedule[date].push({
                                    time: lesson.time,
                                    subject: lesson.subject,
                                    group: group.name,
                                    room: lesson.room
                                });
                            }
                        });
                    });
                });

                setScheduleData({
                    groups: groupsList,
                    teachers: Object.values(teachersMap)
                });

            } catch (err) {
                console.error("Критическая ошибка:", err);
                setError(err.message || "Не удалось загрузить расписание. Проверьте консоль.");
            } finally {
                setIsLoading(false);
            }
        };

        loadAllDocs();
    }, [currentView, scheduleData.groups.length]);

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

    // Если есть ошибка парсинга, показываем её (но только если мы на страницах расписания)
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
                {/* ✅ Показываем спиннер, если идет загрузка и мы на страницах расписания */}
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
                    /* ✅ Рендерим контент */
                    <>
                        {currentView === 'home' && <Home />}
                        {currentView === 'groups' && <GroupsPage data={scheduleData} />}
                        {currentView === 'teachers' && <TeachersPage data={scheduleData} />}
                        {currentView === 'support' && <Support />}
                        {currentView === 'help' && <Help onNavigate={handleNavigate} />}
                        {currentView === 'login' && !currentUser && <Login onLogin={handleLogin} />}
                        {currentView === 'register' && !currentUser && <Register onRegister={handleRegister} />}
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