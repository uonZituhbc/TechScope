const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { supabase, supabaseAdmin } = require('./supabase');

const app = express();
const PORT = 5002;
console.log('REGISTERING TEST ROUTE');

app.get('/api/test-route', (req, res) => {
    console.log('TEST ROUTE WAS REQUESTED');

    res.status(200).send('TECHSCOPE TEST ROUTE WORKS');
});

// Middleware
app.use(cors());
app.use(express.json());

// ======================================
// ADMINISTRATOR VERIFICATION
// ======================================

async function verifyAdmin(req, res, next) {
try {
const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required.'
        });
    }

    const token = authHeader.split(' ')[1];

    const { data: userData, error: authError } =
        await supabase.auth.getUser(token);

    if (authError || !userData.user) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired session.'
        });
    }

    const { data: profile, error: profileError } =
        await supabaseAdmin
            .from('profiles')
            .select('id, role')
            .eq('id', userData.user.id)
            .single();

    if (profileError || !profile || profile.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Administrator access required.'
        });
    }

    req.adminUser = userData.user;
    next();

} catch (error) {
    console.error('Admin verification error:', error.message);

    res.status(500).json({
        success: false,
        message: 'Administrator verification failed.'
    });
}

}

// ======================================
// SUSPEND CONTRIBUTOR
// ======================================

app.post('/api/admin/suspend/:id', verifyAdmin, async (req, res) => {
try {
const { id } = req.params;
const { reason } = req.body;

    if (!reason || !reason.trim()) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a suspension reason.'
        });
    }

    const { data: contributor, error: lookupError } =
        await supabaseAdmin
            .from('profiles')
            .select('id, role, account_status')
            .eq('id', id)
            .single();

    if (lookupError || !contributor) {
        return res.status(404).json({
            success: false,
            message: 'Contributor account not found.'
        });
    }

    if (contributor.role !== 'contributor') {
        return res.status(403).json({
            success: false,
            message: 'Only contributor accounts can be suspended.'
        });
    }

    if (contributor.account_status === 'suspended') {
        return res.status(400).json({
            success: false,
            message: 'This account is already suspended.'
        });
    }

    const { error: banError } =
        await supabaseAdmin.auth.admin.updateUserById(id, {
            ban_duration: '876000h'
        });

    if (banError) throw banError;

    const { error: updateError } =
        await supabaseAdmin
            .from('profiles')
            .update({
                account_status: 'suspended',
                suspension_reason: reason.trim(),
                suspended_at: new Date().toISOString()
            })
            .eq('id', id);

    if (updateError) {
        await supabaseAdmin.auth.admin.updateUserById(id, {
            ban_duration: 'none'
        });

        throw updateError;
    }

    res.json({
        success: true,
        message: 'Contributor account suspended successfully.'
    });

} catch (error) {
    console.error('Suspension error:', error.message);

    res.status(500).json({
        success: false,
        message: 'Unable to suspend contributor account.'
    });
}

});

// ======================================
// REACTIVATE CONTRIBUTOR
// ======================================

app.post('/api/admin/reactivate/:id', verifyAdmin, async (req, res) => {
try {
const { id } = req.params;

    const { data: contributor, error: lookupError } =
        await supabaseAdmin
            .from('profiles')
            .select('id, role, account_status')
            .eq('id', id)
            .single();

    if (lookupError || !contributor) {
        return res.status(404).json({
            success: false,
            message: 'Contributor account not found.'
        });
    }

    if (contributor.role !== 'contributor') {
        return res.status(403).json({
            success: false,
            message: 'Only contributor accounts can be reactivated.'
        });
    }

    if (contributor.account_status !== 'suspended') {
        return res.status(400).json({
            success: false,
            message: 'This account is not suspended.'
        });
    }

    const { error: unbanError } =
        await supabaseAdmin.auth.admin.updateUserById(id, {
            ban_duration: 'none'
        });

    if (unbanError) throw unbanError;

    const { error: updateError } =
        await supabaseAdmin
            .from('profiles')
            .update({
                account_status: 'active',
                suspension_reason: null,
                suspended_at: null
            })
            .eq('id', id);

    if (updateError) {
        await supabaseAdmin.auth.admin.updateUserById(id, {
            ban_duration: '876000h'
        });

        throw updateError;
    }

    res.json({
        success: true,
        message: 'Contributor account reactivated successfully.'
    });

} catch (error) {
    console.error('Reactivation error:', error.message);

    res.status(500).json({
        success: false,
        message: 'Unable to reactivate contributor account.'
    });
}

});

// ======================================
// GET DEACTIVATED CONTRIBUTORS
// ======================================

app.get('/api/admin/deactivated', verifyAdmin, async (req, res) => {
try {
const { data: contributors, error } = await supabaseAdmin
.from('profiles')
.select("id, full_name, email, bio, avatar_url, account_status, suspension_reason, suspended_at, created_at")
.eq('role', 'contributor')
.eq('account_status', 'suspended')
.order('suspended_at', { ascending: false });

    if (error) throw error;

    res.json({
        success: true,
        contributors: contributors || []
    });

} catch (error) {
    console.error('Deactivated accounts error:', error.message);

    res.status(500).json({
        success: false,
        message: 'Unable to retrieve suspended accounts.'
    });
}

});

app.get('/api/test-route', (req, res) => {
    res.json({
        success: true,
        message: 'Admin routes are being registered correctly.'
    });
});
// ======================================
// GENERAL TEST ROUTES
// ======================================
console.log('TECHSCOPE SERVER VERSION 2 IS RUNNING');
app.get('/', (req, res) => {
res.json({
message: 'Welcome to the TechScope Backend API!',
status: 'Running successfully'
});
});

app.get('/api/health', (req, res) => {
res.json({
success: true,
message: 'TechScope API is healthy'
});
});

app.get('/api/supabase-test', async (req, res) => {
try {
const { error } = await supabase
.from('contributors')
.select('id')
.limit(1);

    if (error && error.code !== '42P01' && error.code !== 'PGRST205') {
        return res.status(500).json({
            success: false,
            message: 'Supabase connection encountered an error',
            error: error.message
        });
    }

    res.json({
        success: true,
        message: 'TechScope is communicating with Supabase!'
    });

} catch (error) {
    res.status(500).json({
        success: false,
        message: error.message
    });
}

});

// ======================================
// START SERVER
// ======================================

app.listen(PORT, () => {
    console.log(`TechScope backend running at http://localhost:${PORT}`);
});