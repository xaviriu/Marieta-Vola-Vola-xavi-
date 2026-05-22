const SUPABASE_URL      = 'https://iktdggvtvbvkmprjfmcx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_IhvUuyPNSxm5Wl_-VwRt4A_ZEB9x5WR';

// Guardar referencia a createClient antes de sobreescribir window.supabase
window.supabaseFactory = window.supabase.createClient.bind(window.supabase);
window.supabase        = window.supabaseFactory(SUPABASE_URL, SUPABASE_ANON_KEY);
