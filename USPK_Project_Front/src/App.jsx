import { useState, useEffect } from 'react';
import Login from './Views/Account/Login';
import Register from './Views/Account/Register';
import Home from './Views/Home/Index';
import Support from './Views/Support/Support';
import Dashboard from './Views/Admin/Dashboard';
import UserList from './Views/Admin/UserList';
import Navbar from './Views/Shared/Navbar';
import Footer from './Views/Shared/Footer';
import { authService } from './Services/authService';
import { userApi } from './Services/userApi';

function App() {
    const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

    // ✅ Получаем view из URL параметра или localStorage
    const [currentView, setCurrentView] = useState(() => {
        // Сначала проверяем URL параметр
        const urlParams = new URLSearchParams(window.location.search);
        const viewParam = urlParams.get('view');

        if (viewParam && viewParam !== 'login' && viewParam !== 'register') {
            return viewParam;
        }

        // Затем проверяем localStorage
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
            // Обновляем URL без перезагрузки страницы
            const newUrl = `${window.location.pathname}?view=${currentView}`;
            window.history.pushState({ view: currentView }, '', newUrl);

            // Сохраняем в localStorage
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

    const updateUrlAndStorage = (view) => {
        if (view && view !== 'login' && view !== 'register') {
            const newUrl = `${window.location.pathname}?view=${view}`;
            window.history.pushState({ view }, '', newUrl);
            localStorage.setItem('currentView', view);
        }
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

    // Для отладки - показываем текущий view
    console.log('Current view:', currentView);

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
                {currentView === 'home' && <Home />}

                {currentView === 'support' && <Support />}

                {currentView === 'login' && !currentUser && (
                    <Login onLogin={handleLogin} />
                )}

                {currentView === 'register' && !currentUser && (
                    <Register onRegister={handleRegister} />
                )}

                {currentView === 'dashboard' && currentUser && isAdmin() && (
                    <Dashboard />
                )}

                {currentView === 'userList' && currentUser && isAdmin() && (
                    <UserList
                        users={users}
                        onEdit={handleEditUser}
                        onDelete={handleDeleteUser}
                        onChangeRole={handleChangeRole}
                        isLoading={loading}
                    />
                )}
            </main>

            <Footer onNavigate={handleNavigate} />
        </div>
    );
}

export default App;