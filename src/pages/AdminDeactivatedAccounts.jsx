import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function AdminDeactivatedAccounts() {
    const navigate = useNavigate();

    const [contributors, setContributors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processingId, setProcessingId] = useState(null);

    const [search, setSearch] = useState('');

    useEffect(() => {
        checkAdminAndLoad();
    }, []);

    async function checkAdminAndLoad() {
        try {
            const { data: { user }, error: authError } =
                await supabase.auth.getUser();

            if (authError || !user) {
                navigate('/login');
                return;
            }

            const { data: profile, error: profileError } =
                await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

            if (profileError || profile?.role !== 'admin') {
                navigate('/dashboard');
                return;
            }

            await loadSuspendedAccounts();
        } catch (err) {
            setError('Unable to load administrator information.');
            setLoading(false);
        }
    }

    async function loadSuspendedAccounts() {
        setLoading(true);
        setError('');

        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                navigate('/login');
                return;
            }

            const response = await fetch(
                'http://localhost:5002/api/admin/deactivated',
                {
                    headers: {
                        Authorization: `Bearer ${session.access_token}`
                    }
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to load accounts.');
            }

            setContributors(result.contributors || []);
        } catch (err) {
            setError(err.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    }

    async function reactivateAccount(contributor) {
        const confirmed = window.confirm(
            `Are you sure you want to reactivate ${contributor.full_name}'s account?`
        );

        if (!confirmed) return;

        setProcessingId(contributor.id);
        setError('');

        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                navigate('/login');
                return;
            }

            const response = await fetch(
                `http://localhost:5002/api/admin/reactivate/${contributor.id}`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Reactivation failed.');
            }

            setContributors(previous =>
                previous.filter(item => item.id !== contributor.id)
            );

            window.alert('Contributor account reactivated successfully.');

        } catch (err) {
            setError(err.message);
        } finally {
            setProcessingId(null);
        }
    }

    const filteredContributors = contributors.filter(contributor => {
        const searchValue = search.toLowerCase();

        return (
            contributor.full_name?.toLowerCase().includes(searchValue) ||
            contributor.email?.toLowerCase().includes(searchValue)
        );
    });

    function formatDate(date) {
        if (!date) return 'Not available';

        return new Date(date).toLocaleString();
    }

    if (loading) {
        return (
            <div className="admin-loading">
                Loading suspended accounts...
            </div>
        );
    }

    return (
        <div className="admin-deactivated-page">

            <div className="admin-deactivated-header">
                <div>
                    <span className="admin-section-label">
                        ACCOUNT MANAGEMENT
                    </span>

                    <h1>Deactivated Accounts</h1>

                    <p>
                        Manage suspended contributor accounts and restore
                        access when appropriate.
                    </p>
                </div>

                <Link to="/admin" className="admin-back-link">
                    Back to Dashboard
                </Link>
            </div>

            <div className="deactivated-summary">
                <div>
                    <span>Suspended Contributors</span>
                    <strong>{contributors.length}</strong>
                </div>

                <div>
                    <span>Currently Displayed</span>
                    <strong>{filteredContributors.length}</strong>
                </div>
            </div>

            <div className="deactivated-toolbar">
                <input
                    type="text"
                    placeholder="Search by contributor name or email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />

                <button
                    type="button"
                    onClick={loadSuspendedAccounts}
                    className="deactivated-refresh-btn"
                >
                    Refresh
                </button>
            </div>

            {error && (
                <div className="deactivated-error">
                    {error}
                </div>
            )}

            {filteredContributors.length === 0 ? (
                <div className="deactivated-empty">
                    <div className="deactivated-empty-icon">✓</div>

                    <h3>
                        {search
                            ? 'No matching accounts found'
                            : 'No suspended accounts'}
                    </h3>

                    <p>
                        {search
                            ? 'Try another name or email address.'
                            : 'All contributor accounts are currently active.'}
                    </p>
                </div>
            ) : (
                <div className="deactivated-list">
                    {filteredContributors.map(contributor => (
                        <div
                            className="deactivated-card"
                            key={contributor.id}
                        >
                            <div className="deactivated-card-top">

                                <div className="deactivated-contributor">
                                    {contributor.avatar_url ? (
                                        <img
                                            src={contributor.avatar_url}
                                            alt={contributor.full_name}
                                        />
                                    ) : (
                                        <div className="deactivated-avatar">
                                            {contributor.full_name
                                                ?.charAt(0)
                                                .toUpperCase()}
                                        </div>
                                    )}

                                    <div>
                                        <h3>{contributor.full_name}</h3>
                                        <p>{contributor.email}</p>
                                    </div>
                                </div>

                                <span className="suspended-badge">
                                    Suspended
                                </span>

                            </div>

                            <div className="deactivated-details">
                                <div>
                                    <span>Suspension Date</span>
                                    <strong>
                                        {formatDate(contributor.suspended_at)}
                                    </strong>
                                </div>

                                <div>
                                    <span>Registration Date</span>
                                    <strong>
                                        {formatDate(contributor.created_at)}
                                    </strong>
                                </div>
                            </div>

                            <div className="suspension-reason">
                                <span>Reason for Suspension</span>

                                <p>
                                    {contributor.suspension_reason ||
                                        'No reason provided.'}
                                </p>
                            </div>

                            <div className="deactivated-actions">
                                <Link
                                    to={`/contributor/${contributor.id}`}
                                    className="deactivated-profile-link"
                                >
                                    View Profile
                                </Link>

                                <button
                                    type="button"
                                    onClick={() =>
                                        reactivateAccount(contributor)
                                    }
                                    disabled={processingId === contributor.id}
                                    className="reactivate-account-btn"
                                >
                                    {processingId === contributor.id
                                        ? 'Reactivating...'
                                        : 'Reactivate Account'}
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}

export default AdminDeactivatedAccounts;