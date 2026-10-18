import { useState } from 'react';
import api from '../../Services/api';
import { authService } from '../../Services/authService';

const Dashboard = () => {
    const [publicData, setPublicData] = useState('');
    const [privateData, setPrivateData] = useState('');
    const [adminData, setAdminData] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState({
        public: false,
        private: false,
        admin: false
    });

    const user = authService.getCurrentUser();

    const fetchPublicData = async () => {
        setLoading(prev => ({ ...prev, public: true }));
        try {
            const response = await api.get('/test/public');
            setPublicData(JSON.stringify(response.data, null, 2));
        } catch {
            setError('Failed to fetch public data');
        } finally {
            setLoading(prev => ({ ...prev, public: false }));
        }
    };

    const fetchPrivateData = async () => {
        setLoading(prev => ({ ...prev, private: true }));
        try {
            const response = await api.get('/test/private');
            setPrivateData(JSON.stringify(response.data, null, 2));
        } catch (err) {
            setError('Failed to fetch private data: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(prev => ({ ...prev, private: false }));
        }
    };

    const fetchAdminData = async () => {
        setLoading(prev => ({ ...prev, admin: true }));
        try {
            const response = await api.get('/test/admin');
            setAdminData(JSON.stringify(response.data, null, 2));
        } catch (err) {
            setError('Failed to fetch admin data: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(prev => ({ ...prev, admin: false }));
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Dashboard</h1>
            <p>Welcome, {user?.username}!
                {user?.role && <span> (Role: {user.role})</span>}
            </p>

            {error && (
                <div style={{ color: 'red', marginBottom: '15px' }}>
                    {error}
                </div>
            )}

            <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr' }}>
                {/* Public Data */}
                <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
                    <h3>Public Data</h3>
                    <button
                        onClick={fetchPublicData}
                        disabled={loading.public}
                        style={{ marginBottom: '10px' }}
                    >
                        {loading.public ? 'Loading...' : 'Fetch Public Data'}
                    </button>
                    <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '3px' }}>
                        {publicData || 'No data fetched'}
                    </pre>
                </div>

                {/* Private Data */}
                <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
                    <h3>Private Data (Requires Auth)</h3>
                    <button
                        onClick={fetchPrivateData}
                        disabled={loading.private}
                        style={{ marginBottom: '10px' }}
                    >
                        {loading.private ? 'Loading...' : 'Fetch Private Data'}
                    </button>
                    <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '3px' }}>
                        {privateData || 'No data fetched'}
                    </pre>
                </div>

                {/* Admin Data */}
                <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
                    <h3>Admin Data (Requires Admin Role)</h3>
                    <button
                        onClick={fetchAdminData}
                        disabled={loading.admin}
                        style={{ marginBottom: '10px' }}
                    >
                        {loading.admin ? 'Loading...' : 'Fetch Admin Data'}
                    </button>
                    <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '3px' }}>
                        {adminData || 'No data fetched'}
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;