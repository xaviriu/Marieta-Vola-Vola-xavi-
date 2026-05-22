// Vercel Serverless Function — Crear alumno con acceso a cursos
// Solo puede llamarse con un token de admin válido de Supabase
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

  // Verificar que quien llama es admin
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

  // Crear la cuenta del alumno
  const { email, password, nombre, cursoIds = [] } = req.body;

  if (!email || !password || !nombre) {
    return res.status(400).json({ error: 'Email, contraseña y nombre son obligatorios' });
  }

  const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nombre }
  });

  if (createError) return res.status(400).json({ error: createError.message });

  // Asignar cursos
  if (cursoIds.length > 0) {
    const matriculas = cursoIds.map(cursoId => ({
      user_id: newUser.user.id,
      curso_id: cursoId
    }));
    const { error: matError } = await supabaseAdmin.from('matriculas').insert(matriculas);
    if (matError) return res.status(400).json({ error: matError.message });
  }

  return res.status(200).json({ success: true, userId: newUser.user.id });
};
