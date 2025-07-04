import express from 'express';
const supabase = require('../services/supabase');

const router = express.Router();

// Middleware simples para autenticação (exemplo)
// Ideal: substituir por JWT, sessão ou Supabase Auth
const autenticarPaciente = async (req, res, next) => {
  const pacienteId = req.headers['x-paciente-id'];
  if (!pacienteId) return res.status(401).json({ erro: 'Não autorizado' });

  // Opcional: verificar paciente existe
  const { data, error } = await supabaseClient
    .from('pacientes')
    .select('id')
    .eq('id', pacienteId)
    .single();

  if (error || !data) return res.status(401).json({ erro: 'Paciente não encontrado' });

  req.pacienteId = pacienteId;
  next();
};

// Rota para registrar pressão (paciente logado)
router.post('/registrar-pressao', autenticarPaciente, async (req, res) => {
  const { sistolica, diastolica, observacao } = req.body;

  if (!sistolica || !diastolica) {
    return res.status(400).json({ erro: 'Valores sistólica e diastólica são obrigatórios' });
  }

  try {
    const { data, error } = await supabaseClient
      .from('registros_pressao')
      .insert([{ paciente_id: req.pacienteId, sistolica, diastolica, observacao }]);

    if (error) throw error;

    res.json({ sucesso: true, registro: data[0] });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao salvar registro' });
  }
});

// Rota para listar pressões do paciente logado
router.get('/meus-registros', autenticarPaciente, async (req, res) => {
  try {
    const { data, error } = await supabaseClient
      .from('registros_pressao')
      .select('*')
      .eq('paciente_id', req.pacienteId)
      .order('data', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar registros' });
  }
});

export default router;
