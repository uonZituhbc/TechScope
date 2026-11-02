const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey || !serviceKey) {
    throw new Error('Supabase configuration is incomplete. Check server/.env');
}

// Regular client
const supabase = createClient(supabaseUrl, supabaseKey);

// Privileged backend client
const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

module.exports = {
    supabase,
    supabaseAdmin
};