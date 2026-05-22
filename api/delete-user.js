// Vercel Serverless Function — Eliminar alumno
const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const token = authHeader.replace('Bearer ', '');

  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Verificar admin
  const { data: { user }, error: tokenError } = await supabaseAdmin.auth.getUser(token);
  if (tokenError || !user) return res.status(401).json({ error: 'Token inválido' });

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('es_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.es_admin) {
    return res.status(403).json({ error: 'No tienes permisos de administrador' });
  }

  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId es obligatorio' });

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) return res.status(400).json({ error: error.message });

  return res.status(200).json({ success: true });
};
